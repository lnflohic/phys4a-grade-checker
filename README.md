# PHYS-004A Grade Checker

A web application for students to check their current grade in PHYS-004A Engineering Physics: Mechanics based on Learning Outcomes (SLOs), with **progress grade calculation** for incomplete assessments.

## Features

- ✅ Clean, intuitive interface
- ✅ N/A checkboxes for unevaluated outcomes
- ✅ **Progress grade calculation** - see your current standing even with incomplete assessments
- ✅ **Best/worst case projections** - understand your grade range based on remaining SLOs
- ✅ Automatic grade calculation based on course requirements
- ✅ Visual checklist showing which requirements are met
- ✅ Summary statistics of performance
- ✅ Responsive design that works on desktop and mobile

## How to Use

### For Students:

1. **Open the application**: Open `index.html` in any modern web browser (Chrome, Firefox, Safari, Edge)

2. **Enter your scores**:
   - Go to Canvas → Grades → Click "Learning Mastery" tab
   - For each Student Learning Outcome (SLO), either:
     - Enter your score (0.0 to 3.0)
     - Check "N/A" if it hasn't been assessed yet
   - Enter the number of labs you've missed
   - Enter your project SLO information (or mark as N/A)
   - Enter your concept matching score from the final (or mark as N/A if not taken yet)

3. **Calculate your grade**: Click the "Calculate My Grade" button

4. **Review your results**:
   - See your **current letter grade** based on evaluated SLOs
   - View the **completion percentage** (e.g., "65% of SLOs Evaluated")
   - Check **grade projections**:
     - **Best case**: If all remaining SLOs = 3.0
     - **Worst case**: If all remaining SLOs = 0.0
     - **Current trajectory**: Based only on evaluated SLOs
   - Review which requirements you've met/not met
   - Check your detailed performance statistics

5. **Reset if needed**: Click "Enter New Scores" to start over

## Understanding Progress Grades

### How It Works

The calculator intelligently handles incomplete assessments:

- **Current Grade**: Based ONLY on SLOs that have been evaluated
- **Best Case Scenario**: Assumes you get 3.0 on all remaining SLOs
- **Worst Case Scenario**: Assumes you get 0.0 on all remaining SLOs
- **Grade Range**: Shows the possible range of final grades

### Example Scenarios

**Scenario 1: Early in the Semester**
- 30% of SLOs evaluated
- Current grade might show wide range (e.g., B to F)
- As more SLOs are assessed, the range narrows

**Scenario 2: Mid-Semester**
- 65% of SLOs evaluated
- Range might narrow (e.g., B to D)
- You can see what you need to achieve to reach target grade

**Scenario 3: Near End of Semester**
- 90% of SLOs evaluated
- Grade is nearly determined
- May show: "Your grade will be: B (regardless of remaining SLO scores)"

## Understanding Your Grade

The course uses a specifications-based grading system with the following requirements:

### A Grade Requirements:
- All 12 physics SLOs ≥2.0
- 8/12 physics SLOs ≥2.5
- 3/5 lab SLOs ≥2.0 (Note: syllabus says 3/4 but there are 5 total)
- 2/5 lab SLOs ≥2.5 (Note: syllabus says 2/4 but there are 5 total)
- Missed one lab at most
- Behavior SLOs ≥2.0
- All project SLOs ≥2.0
- 1/3 of project SLO =3.0
- ≥2.0 on concept matching on final

### B Grade Requirements:
- 9/12 physics SLOs ≥2.0
- 4/12 physics SLOs ≥2.5
- 2/5 lab SLOs ≥2.0
- 1/5 lab SLOs ≥2.5
- Missed two labs at most
- One behavior SLO ≥2.0
- No SLO <1.7
- 2/3 of project SLO ≥2.0

### C Grade Requirements:
- 6/12 physics SLOs ≥2.0
- 2/5 lab SLOs ≥2.0
- No physics or lab SLOs <1.5
- Missed three labs at most

### D Grade Requirements:
- 4/12 physics SLOs ≥2.0
- No physics or lab SLOs <1.3
- 1/5 lab SLOs ≥2.0
- Missed four labs at most

## For Instructors:

### Customization

You can customize the application by editing:

- **script.js**: Modify the grading criteria in the `determineGrade()` function
  - Update the number of SLOs required for each grade
  - Change threshold values (2.0, 2.5, etc.)
  - Modify best/worst case assumptions
- **styles.css**: Change colors, fonts, and layout
- **index.html**: Add or remove SLO fields

### Deployment Options

1. **Simple file sharing**: Share the three files (HTML, CSS, JS) with students via Canvas or email
2. **Web hosting**: Upload to any web server or use free hosting like:
   - GitHub Pages (recommended)
   - Netlify
   - Vercel
3. **Canvas integration**: Embed as an external tool or link from your Canvas course

### GitHub Pages Deployment

1. Create a GitHub repository
2. Upload `index.html`, `styles.css`, and `script.js`
3. Go to Settings → Pages
4. Select "Deploy from branch" and choose your main branch
5. Your app will be available at `https://[username].github.io/[repo-name]`

## Technical Details

- **No backend required**: Runs entirely in the browser
- **No data storage**: All calculations are done client-side, no data is saved or transmitted
- **Privacy-friendly**: No personal information leaves the student's device
- **Browser compatibility**: Works in all modern browsers (Chrome, Firefox, Safari, Edge)
- **No dependencies**: Pure HTML, CSS, and JavaScript - no external libraries needed

## Files Structure

```
gradecheck/
├── index.html      # Main HTML structure with N/A checkboxes
├── styles.css      # Styling and layout
├── script.js       # Grade calculation logic with progress tracking
└── README.md       # This file
```

## How the Progress Grade Algorithm Works

The application uses three calculation modes:

1. **Current Stats**: Only counts evaluated SLOs
   - Skips requirements that can't be evaluated yet
   - Shows "Not yet evaluated" for incomplete requirements

2. **Best Case Stats**: Assumes 3.0 for all unevaluated SLOs
   - Shows maximum achievable grade
   - Helps students see what's possible

3. **Worst Case Stats**: Assumes 0.0 for all unevaluated SLOs
   - Shows minimum guaranteed grade
   - Helps students understand risks

The final display shows:
- Progress indicator (% of SLOs evaluated)
- Current grade based on trajectory
- Projected grade range
- Detailed checklist with met/unmet/pending requirements

## Tips for Students

1. **Update regularly**: Check your grade after each assessment
2. **Focus on weak areas**: Identify which requirements you're not meeting
3. **Plan ahead**: Use best/worst case scenarios to plan your study strategy
4. **Ask for help early**: If worst case shows failing grade, seek help immediately
5. **Track your progress**: The completion percentage shows how much of the course is left

## Frequently Asked Questions

**Q: Why does my grade show a range?**
A: When not all SLOs are evaluated, your final grade depends on future performance. The range shows your best and worst possible outcomes.

**Q: Should I check N/A or enter 0?**
A: Always check N/A for unevaluated SLOs. Entering 0 will incorrectly lower your grade.

**Q: What if my best and worst case are the same?**
A: This means your grade is already determined by your current performance, regardless of remaining SLOs.

**Q: Why are there 5 lab SLOs but the syllabus mentions 4?**
A: The Canvas course has 5 lab skills standards. The calculator notes this discrepancy.

## Support

For questions about:
- **Your grades**: Contact your course instructor
- **How to use this tool**: Refer to this README or contact your instructor
- **Technical issues**: Check that you're using a modern browser with JavaScript enabled

## Version History

- **v2.0**: Added N/A checkboxes and progress grade calculation
- **v1.0**: Initial release with basic grade calculation

## License

This tool is provided as-is for educational purposes. Feel free to modify and adapt for your own courses.
