/**
 * Service to generate structured mock HR datasets for demo purposes.
 */

export class MockService {
  /**
   * Generates mock data matching the target HR schema.
   * @param {number} rowsCount Number of rows to generate.
   * @returns {Array} List of mock employee objects.
   */
  static generateSampleData(rowsCount = 100) {
    const departments = ['Engineering', 'HR', 'Sales', 'Marketing', 'Finance', 'Product', 'Legal', 'Operations', 'Customer Success'];
    const genders = ['Male', 'Female', 'Non-binary'];
    
    const mockData = [];
    const now = new Date();
    
    for (let i = 1; i <= rowsCount; i++) {
      const empId = `EMP-${String(i).padStart(5, '0')}`;
      const department = departments[Math.floor(Math.random() * departments.length)];
      const gender = genders[Math.floor(Math.random() * genders.length)];
      
      // Age between 21 and 62
      const age = Math.floor(Math.random() * 42) + 21;
      
      // Hire date between 1 and 10 years ago
      const hireYearsAgo = Math.random() * 9 + 1;
      const hireDate = new Date(now.getTime() - hireYearsAgo * 365.25 * 24 * 60 * 60 * 1000);
      
      // 8% chance of termination if hire is > 2 years ago
      let terminationDate = null;
      if (hireYearsAgo > 2 && Math.random() < 0.08) {
        const employedTime = Math.random() * (hireYearsAgo - 0.5) + 0.5; // at least 6 months
        terminationDate = new Date(hireDate.getTime() + employedTime * 365.25 * 24 * 60 * 60 * 1000);
      }
      
      // Salary correlated with age and department
      let baseSalary = 50000;
      if (department === 'Engineering' || department === 'Product') baseSalary += 35000;
      if (department === 'Legal' || department === 'Finance') baseSalary += 20000;
      baseSalary += (age - 21) * 1500; // age experience bump
      const salary = Math.round(baseSalary + (Math.random() * 20000 - 10000));
      
      // Performance & Engagement between 1.0 and 5.0
      const performance = Math.round((Math.random() * 4 + 1) * 10) / 10;
      const engagement = Math.round((Math.random() * 4 + 1) * 10) / 10;
      
      // Absence days, training hours, promotion count
      const absenceDays = Math.floor(Math.random() * 15);
      const trainingHours = Math.floor(Math.random() * 80) + 10;
      const promotionCount = Math.floor(Math.random() * 3);
      
      // Calculate tenure (Years)
      const diffTime = Math.abs((terminationDate || now).getTime() - hireDate.getTime());
      const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      const tenure = Math.round(diffYears * 10) / 10;

      mockData.push({
        Employee_ID: empId,
        Department: department,
        Hire_Date: hireDate.toISOString().split('T')[0],
        Termination_Date: terminationDate ? terminationDate.toISOString().split('T')[0] : null,
        End_Date: terminationDate ? terminationDate.toISOString().split('T')[0] : null,
        Tenure: tenure,
        Gender: gender,
        Age: age,
        Salary: salary,
        Performance_Score: performance,
        Absence_Days: absenceDays,
        Training_Hours: trainingHours,
        Promotion_Count: promotionCount,
        Engagement_Score: engagement
      });
    }

    return mockData;
  }

  /**
   * Generates a sample XLSX file using SheetJS and triggers download.
   * @param {number} rowsCount Number of rows to generate.
   */
  static downloadSampleExcel(rowsCount = 100) {
    const mockData = this.generateSampleData(rowsCount);
    
    // Transform keys for the Excel headers
    const excelRows = mockData.map(emp => ({
      'Employee_ID': emp.Employee_ID,
      'Department': emp.Department,
      'Hire_Date': emp.Hire_Date,
      'Termination_Date': emp.Termination_Date,
      'End_Date': emp.End_Date,
      'Tenure (Years)': emp.Tenure,
      'Gender': emp.Gender,
      'Age': emp.Age,
      'Salary': emp.Salary,
      'Performance_Score': emp.Performance_Score,
      'Absence_Days': emp.Absence_Days,
      'Training_Hours': emp.Training_Hours,
      'Promotion_Count': emp.Promotion_Count,
      'Engagement_Score': emp.Engagement_Score
    }));

    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sample_HR_Data');

    // Auto-fit column widths
    const maxKeys = Object.keys(excelRows[0]);
    worksheet['!cols'] = maxKeys.map(key => ({ wch: Math.max(key.length + 3, 14) }));

    XLSX.writeFile(workbook, `HR_Sample_Dataset_${rowsCount}_Rows.xlsx`);
  }
}
