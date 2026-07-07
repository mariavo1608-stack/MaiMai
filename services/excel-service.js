/**
 * Service to handle loading and parsing Excel (.xlsx) files using SheetJS.
 */

export class ExcelService {
  /**
   * Reads an Excel file and converts the first sheet into a JSON array.
   * @param {File} file The uploaded file object.
   * @param {Function} onProgress Callback for tracking processing steps.
   * @returns {Promise<Array>} A promise resolving to the parsed data array.
   */
  static parseExcel(file, onProgress = () => {}) {
    return new Promise((resolve, reject) => {
      onProgress({ status: 'reading', message: 'Reading file from disk...', progress: 10 });
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          onProgress({ status: 'parsing', message: 'Parsing workbook structure...', progress: 40 });
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, {
            type: 'array',
            cellDates: true, // Parse dates automatically
            cellNF: false,
            cellText: false
          });

          if (!workbook.SheetNames.length) {
            throw new Error('The uploaded file does not contain any sheets.');
          }

          onProgress({ status: 'extracting', message: 'Extracting rows...', progress: 70 });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          
          // Convert sheet to JSON array
          const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: null });
          
          onProgress({ status: 'cleaning', message: 'Cleaning and normalizing data...', progress: 90 });
          const cleanedData = this.cleanAndNormalizeData(rawData);

          onProgress({ status: 'done', message: 'Data loaded successfully!', progress: 100 });
          resolve(cleanedData);
        } catch (error) {
          reject(new Error(`Failed to parse Excel file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error('FileReader encountered an error reading the file.'));
      };

      reader.readAsArrayBuffer(file);
    });
  }

  /**
   * Normalizes keys, parses strings to numbers/dates, and calculates missing values.
   * @param {Array} data The raw JSON array from SheetJS.
   * @returns {Array} Cleaned data.
   */
  static cleanAndNormalizeData(data) {
    if (!Array.isArray(data) || data.length === 0) return [];

    return data.map((row, index) => {
      const cleanRow = {};
      
      // Standardize keys (remove spaces, match known headers case-insensitively)
      Object.keys(row).forEach(key => {
        const standardKey = this.standardizeKey(key);
        cleanRow[standardKey] = row[key];
      });

      // ID defaults to index if not provided
      cleanRow.Employee_ID = cleanRow.Employee_ID !== null && cleanRow.Employee_ID !== undefined 
        ? String(cleanRow.Employee_ID) 
        : `EMP-${String(index + 1).padStart(5, '0')}`;

      // Department
      cleanRow.Department = cleanRow.Department ? String(cleanRow.Department).trim() : 'Unknown';

      // Gender
      cleanRow.Gender = cleanRow.Gender ? String(cleanRow.Gender).trim() : 'Unknown';

      // Parse Dates
      cleanRow.Hire_Date = this.parseDate(cleanRow.Hire_Date);
      cleanRow.Termination_Date = this.parseDate(cleanRow.Termination_Date);
      cleanRow.End_Date = this.parseDate(cleanRow.End_Date) || cleanRow.Termination_Date;

      // Parse Numeric Attributes with fallbacks
      cleanRow.Age = this.parseNumber(cleanRow.Age, 35); // default age 35
      cleanRow.Salary = this.parseNumber(cleanRow.Salary, 60000); // default salary $60k
      cleanRow.Performance_Score = this.parseNumber(cleanRow.Performance_Score, 3); // default Performance 3 (on 1-5 scale)
      cleanRow.Absence_Days = this.parseNumber(cleanRow.Absence_Days, 0);
      cleanRow.Training_Hours = this.parseNumber(cleanRow.Training_Hours, 0);
      cleanRow.Promotion_Count = this.parseNumber(cleanRow.Promotion_Count, 0);
      cleanRow.Engagement_Score = this.parseNumber(cleanRow.Engagement_Score, 3); // default Engagement 3 (on 1-5 scale)

      // Calculate Tenure if missing
      if (cleanRow.Tenure === undefined || cleanRow.Tenure === null) {
        if (cleanRow.Hire_Date) {
          const endDate = cleanRow.End_Date || new Date(); // default to now if active
          const diffTime = Math.abs(endDate.getTime() - cleanRow.Hire_Date.getTime());
          const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
          cleanRow.Tenure = Math.round(diffYears * 10) / 10; // 1 decimal place
        } else {
          cleanRow.Tenure = 2.0; // standard fallback
        }
      } else {
        // If tenure is string (e.g. "3 years 2 months" or similar), try to parse a number
        cleanRow.Tenure = this.parseNumber(cleanRow.Tenure, 2.0);
      }

      return cleanRow;
    });
  }

  /**
   * Map messy spreadsheet header labels to our clean object keys.
   */
  static standardizeKey(key) {
    const k = String(key).trim().toLowerCase().replace(/[\s_]+/g, '');
    
    if (k.includes('empid') || k.includes('employeeid') || k === 'id') return 'Employee_ID';
    if (k === 'department' || k === 'dept' || k === 'phongban') return 'Department';
    if (k.includes('hiredate') || k === 'ngayvao') return 'Hire_Date';
    if (k.includes('terminationdate') || k === 'ngaynghi') return 'Termination_Date';
    if (k.includes('enddate')) return 'End_Date';
    if (k === 'tenure' || k.includes('thamnien')) return 'Tenure';
    if (k === 'gender' || k === 'gioitinh' || k === 'sex') return 'Gender';
    if (k === 'age' || k === 'tuoi') return 'Age';
    if (k === 'salary' || k === 'luong' || k.includes('salary')) return 'Salary';
    if (k.includes('performance') || k === 'danhgia' || k === 'perf') return 'Performance_Score';
    if (k.includes('absence') || k === 'nghiphep' || k.includes('absent')) return 'Absence_Days';
    if (k.includes('training') || k.includes('daotao')) return 'Training_Hours';
    if (k.includes('promotion') || k === 'thangchuc') return 'Promotion_Count';
    if (k.includes('engagement') || k === 'ganket') return 'Engagement_Score';

    // Fallback: return capitalized version
    return key;
  }

  /**
   * Safely parses any date string/object.
   */
  static parseDate(val) {
    if (!val) return null;
    if (val instanceof Date) return val;
    
    // Check if Excel serial number date
    if (typeof val === 'number') {
      const date = new Date((val - 25569) * 86400 * 1000);
      return isNaN(date.getTime()) ? null : date;
    }

    const d = new Date(val);
    return isNaN(d.getTime()) ? null : d;
  }

  /**
   * Safely extracts numeric value.
   */
  static parseNumber(val, fallback = 0) {
    if (val === null || val === undefined) return fallback;
    if (typeof val === 'number') return val;
    
    // Clean string: remove $, commas, spaces
    const cleanStr = String(val).replace(/[\$,\s]/g, '');
    const num = parseFloat(cleanStr);
    return isNaN(num) ? fallback : num;
  }
}
