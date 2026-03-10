// Grade Checker Application with Progress Grade Calculation and Scaled Requirements
document.addEventListener('DOMContentLoaded', function() {
    const manualEntrySection = document.getElementById('manualEntrySection');
    const resultsSection = document.getElementById('resultsSection');
    const calculateBtn = document.getElementById('calculateBtn');
    const resetBtn = document.getElementById('resetBtn');

    // Handle N/A checkboxes
    document.querySelectorAll('.na-check').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const targetIndex = this.getAttribute('data-target');
            const inputClass = this.classList.contains('physics-na') ? '.physics-slo' :
                              this.classList.contains('lab-na') ? '.lab-slo' : '.behavior-slo';
            const input = document.querySelector(`${inputClass}[data-index="${targetIndex}"]`);

            if (input) {
                input.disabled = this.checked;
                if (this.checked) {
                    input.value = '';
                }
            }
        });
    });

    // Handle special N/A checkboxes
    ['projectNA', 'project3NA', 'conceptNA'].forEach(id => {
        const checkbox = document.getElementById(id);
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                const inputId = id.replace('NA', '');
                const input = document.getElementById(inputId === 'project' ? 'projectSLOs' :
                                                     inputId === 'project3' ? 'projectSLOs3' :
                                                     'conceptMatching');
                if (input) {
                    input.disabled = this.checked;
                    if (this.checked) {
                        input.value = '';
                    }
                }
            });
        }
    });

    // Calculate grade
    calculateBtn.addEventListener('click', calculateGrade);
    resetBtn.addEventListener('click', resetForm);

    // Current week — update each semester (Spring 2026 = week 7 at time of release)
    const CURRENT_WEEK = 7;

    // SLO names for improvement messages
    const physicsSLONames = [
        'Apply a problem-solving strategy',
        'Explain and apply core physical principles to 1-D motion',
        'Explain and apply core physical principles to 2-D motion',
        "Apply Newton's laws of motion to a system",
        "Apply Newton's law of motion to rotating objects (torque)",
        'Apply the principle of conservation of energy',
        'Apply the principle of conservation of momentum',
        'Apply principles of conservation of energy/momentum to rotating objects',
        'Apply the principles of fluid physics',
        'Apply the principles of rotational kinematics and dynamics',
        'Display good scientific practices',
        'Calculate different energies of a system and work done by a force',
        'Calculate the forces experienced by objects in a fluid'
    ];

    const labSLONames = [
        'Analyze real-world experimental data',
        'Collaborate with other students in problem-solving and laboratory activities',
        'Create lab reports in line with scientific standards',
        'Observe, make a hypothesis, create a test'
    ];

    function getScores(selector, naSelector) {
        const scores = [];
        const inputs = document.querySelectorAll(selector);
        const naChecks = document.querySelectorAll(naSelector);

        inputs.forEach((input, index) => {
            const naCheck = naChecks[index];
            if (naCheck && naCheck.checked) {
                scores.push(null); // N/A
            } else {
                const value = parseFloat(input.value);
                scores.push(isNaN(value) ? 0 : value);
            }
        });

        return scores;
    }

    function calculateGrade() {
        // Collect all scores
        const physicsSLOs = getScores('.physics-slo', '.physics-na');
        const labSLOs = getScores('.lab-slo', '.lab-na');
        const behaviorSLOs = getScores('.behavior-slo', '.behavior-na');

        const labsMissed = parseInt(document.getElementById('labsMissed').value) || 0;

        const projectNA = document.getElementById('projectNA').checked;
        const project3NA = document.getElementById('project3NA').checked;
        const conceptNA = document.getElementById('conceptNA').checked;

        const projectSLOs = projectNA ? null : (parseInt(document.getElementById('projectSLOs').value) || 0);
        const projectSLOs3 = project3NA ? null : (parseInt(document.getElementById('projectSLOs3').value) || 0);
        const conceptMatching = conceptNA ? null : (parseFloat(document.getElementById('conceptMatching').value) || 0);

        // Calculate current statistics (only evaluated SLOs)
        const evaluatedPhysics = physicsSLOs.filter(s => s !== null);
        const evaluatedLab = labSLOs.filter(s => s !== null);
        const evaluatedBehavior = behaviorSLOs.filter(s => s !== null);

        const currentStats = {
            physicsSLOsAbove2: evaluatedPhysics.filter(s => s >= 2.0).length,
            physicsSLOsAbove2_5: evaluatedPhysics.filter(s => s >= 2.5).length,
            labSLOsAbove2: evaluatedLab.filter(s => s >= 2.0).length,
            labSLOsAbove2_5: evaluatedLab.filter(s => s >= 2.5).length,
            behaviorSLOsAbove2: evaluatedBehavior.length > 0 ? evaluatedBehavior.filter(s => s >= 2.0).length : null,
            labsMissed: labsMissed,
            projectSLOs: projectSLOs,
            projectSLOs3: projectSLOs3,
            conceptMatching: conceptMatching,
            minSLO: Math.min(...[...evaluatedPhysics, ...evaluatedLab].filter(s => s > 0)),
            minPhysicsSLO: evaluatedPhysics.length > 0 ? Math.min(...evaluatedPhysics.filter(s => s > 0)) : Infinity,
            minLabSLO: evaluatedLab.length > 0 ? Math.min(...evaluatedLab.filter(s => s > 0)) : Infinity,
            totalEvaluatedPhysics: evaluatedPhysics.length,
            totalEvaluatedLab: evaluatedLab.length,
            totalPhysics: 13,
            totalLab: 4
        };

        // Calculate best case and worst case scenarios
        const bestCaseStats = calculateBestCase(physicsSLOs, labSLOs, behaviorSLOs, currentStats);
        const worstCaseStats = calculateWorstCase(physicsSLOs, labSLOs, behaviorSLOs, currentStats);

        // Determine grades
        const currentGrade = determineGrade(currentStats, 'current');
        const bestGrade = determineGrade(bestCaseStats, 'best');
        const worstGrade = determineGrade(worstCaseStats, 'worst');

        displayResults({
            current: currentGrade,
            best: bestGrade,
            worst: worstGrade
        }, {
            current: currentStats,
            best: bestCaseStats,
            worst: worstCaseStats
        }, physicsSLOs, labSLOs);
    }

    function calculateBestCase(physicsSLOs, labSLOs, behaviorSLOs, currentStats) {
        // Assume all unevaluated SLOs get 3.0
        const bestPhysics = physicsSLOs.map(s => s === null ? 3.0 : s);
        const bestLab = labSLOs.map(s => s === null ? 3.0 : s);
        const bestBehavior = behaviorSLOs.map(s => s === null ? 3.0 : s);

        return {
            physicsSLOsAbove2: bestPhysics.filter(s => s >= 2.0).length,
            physicsSLOsAbove2_5: bestPhysics.filter(s => s >= 2.5).length,
            labSLOsAbove2: bestLab.filter(s => s >= 2.0).length,
            labSLOsAbove2_5: bestLab.filter(s => s >= 2.5).length,
            behaviorSLOsAbove2: bestBehavior.filter(s => s >= 2.0).length,
            labsMissed: currentStats.labsMissed,
            projectSLOs: currentStats.projectSLOs === null ? 3 : currentStats.projectSLOs,
            projectSLOs3: currentStats.projectSLOs3 === null ? 3 : currentStats.projectSLOs3,
            conceptMatching: currentStats.conceptMatching === null ? 3.0 : currentStats.conceptMatching,
            minSLO: Math.min(...[...bestPhysics, ...bestLab]),
            minPhysicsSLO: Math.min(...bestPhysics),
            minLabSLO: Math.min(...bestLab),
            totalEvaluatedPhysics: 13,
            totalEvaluatedLab: 4,
            totalPhysics: 13,
            totalLab: 4
        };
    }

    function calculateWorstCase(physicsSLOs, labSLOs, behaviorSLOs, currentStats) {
        // Assume all unevaluated SLOs get 0.0
        const worstPhysics = physicsSLOs.map(s => s === null ? 0.0 : s);
        const worstLab = labSLOs.map(s => s === null ? 0.0 : s);
        const worstBehavior = behaviorSLOs.map(s => s === null ? 0.0 : s);

        return {
            physicsSLOsAbove2: worstPhysics.filter(s => s >= 2.0).length,
            physicsSLOsAbove2_5: worstPhysics.filter(s => s >= 2.5).length,
            labSLOsAbove2: worstLab.filter(s => s >= 2.0).length,
            labSLOsAbove2_5: worstLab.filter(s => s >= 2.5).length,
            behaviorSLOsAbove2: worstBehavior.filter(s => s >= 2.0).length,
            labsMissed: currentStats.labsMissed,
            projectSLOs: currentStats.projectSLOs === null ? 0 : currentStats.projectSLOs,
            projectSLOs3: currentStats.projectSLOs3 === null ? 0 : currentStats.projectSLOs3,
            conceptMatching: currentStats.conceptMatching === null ? 0.0 : currentStats.conceptMatching,
            minSLO: Math.min(...[...worstPhysics, ...worstLab].filter(s => s >= 0)),
            minPhysicsSLO: worstPhysics.length > 0 ? Math.min(...worstPhysics.filter(s => s >= 0)) : 0,
            minLabSLO: worstLab.length > 0 ? Math.min(...worstLab.filter(s => s >= 0)) : 0,
            totalEvaluatedPhysics: 13,
            totalEvaluatedLab: 4,
            totalPhysics: 13,
            totalLab: 4
        };
    }

    function determineGrade(stats, scenario) {
        // For current grade, handle N/A values and scale requirements
        const isNA = (val) => val === null || val === undefined;

        const numPhysics = stats.totalEvaluatedPhysics;
        const numLab = stats.totalEvaluatedLab;

        // Skip requirements if no SLOs are evaluated in that category
        const skipPhysics = numPhysics === 0;
        const skipLab = numLab === 0;
        const skipBehavior = isNA(stats.behaviorSLOsAbove2);

        // Check for A
        const aRequirements = [
            {
                met: skipPhysics ? null : stats.physicsSLOsAbove2 >= numPhysics,
                label: skipPhysics ? 'All physics SLOs ≥2.0' : `All ${numPhysics} physics SLOs ≥2.0`,
                skip: skipPhysics
            },
            {
                met: skipPhysics ? null : stats.physicsSLOsAbove2_5 >= Math.ceil(numPhysics * (8/12)),
                label: skipPhysics ? '2/3 physics SLOs ≥2.5' :
                    numPhysics >= 12 ? '8/12 physics SLOs ≥2.5' : `${Math.ceil(numPhysics * (8/12))}/${numPhysics} physics SLOs ≥2.5`,
                skip: skipPhysics
            },
            {
                met: skipLab ? null : stats.labSLOsAbove2 >= Math.ceil(numLab * (3/5)),
                label: skipLab ? '3/5 lab SLOs ≥2.0' :
                    numLab >= 5 ? '3/5 lab SLOs ≥2.0' : `${Math.ceil(numLab * (3/5))}/${numLab} lab SLOs ≥2.0`,
                skip: skipLab
            },
            {
                met: skipLab ? null : stats.labSLOsAbove2_5 >= Math.ceil(numLab * (2/5)),
                label: skipLab ? '2/5 lab SLOs ≥2.5' :
                    numLab >= 5 ? '2/5 lab SLOs ≥2.5' : `${Math.ceil(numLab * (2/5))}/${numLab} lab SLOs ≥2.5`,
                skip: skipLab
            },
            {
                met: stats.labsMissed <= 1,
                label: 'Missed one lab at most',
                skip: false
            },
            {
                met: skipBehavior ? null : stats.behaviorSLOsAbove2 >= 2,
                label: 'Behavior SLOs ≥2.0',
                skip: skipBehavior
            },
            {
                met: !isNA(stats.projectSLOs) && stats.projectSLOs >= 3,
                label: 'All project SLOs ≥2.0',
                skip: isNA(stats.projectSLOs)
            },
            {
                met: !isNA(stats.projectSLOs3) && stats.projectSLOs3 >= 1,
                label: '1/3 of project SLO =3.0',
                skip: isNA(stats.projectSLOs3)
            },
            {
                met: !isNA(stats.conceptMatching) && stats.conceptMatching >= 2.0,
                label: '≥2.0 on concept matching on final',
                skip: isNA(stats.conceptMatching)
            }
        ];

        const relevantA = aRequirements.filter(r => !r.skip);
        if (relevantA.length > 0 && relevantA.every(r => r.met)) {
            return { letter: 'A', requirements: aRequirements, description: 'Excellent work! You meet all A-level requirements.' };
        }

        // Check for B
        const bRequirements = [
            {
                met: skipPhysics ? null : stats.physicsSLOsAbove2 >= Math.ceil(numPhysics * (9/12)),
                label: skipPhysics ? '3/4 physics SLOs ≥2.0' :
                    numPhysics >= 12 ? '9/12 physics SLOs ≥2.0' : `${Math.ceil(numPhysics * (9/12))}/${numPhysics} physics SLOs ≥2.0`,
                skip: skipPhysics
            },
            {
                met: skipPhysics ? null : stats.physicsSLOsAbove2_5 >= Math.ceil(numPhysics * (4/12)),
                label: skipPhysics ? '1/3 physics SLOs ≥2.5' :
                    numPhysics >= 12 ? '4/12 physics SLOs ≥2.5' : `${Math.ceil(numPhysics * (4/12))}/${numPhysics} physics SLOs ≥2.5`,
                skip: skipPhysics
            },
            {
                met: skipLab ? null : stats.labSLOsAbove2 >= Math.ceil(numLab * (2/5)),
                label: skipLab ? '2/5 lab SLOs ≥2.0' :
                    numLab >= 5 ? '2/5 lab SLOs ≥2.0' : `${Math.ceil(numLab * (2/5))}/${numLab} lab SLOs ≥2.0`,
                skip: skipLab
            },
            {
                met: skipLab ? null : stats.labSLOsAbove2_5 >= Math.ceil(numLab * (1/5)),
                label: skipLab ? '1/5 lab SLOs ≥2.5' :
                    numLab >= 5 ? '1/5 lab SLOs ≥2.5' : `${Math.ceil(numLab * (1/5))}/${numLab} lab SLOs ≥2.5`,
                skip: skipLab
            },
            {
                met: stats.labsMissed <= 2,
                label: 'Missed two labs at most',
                skip: false
            },
            {
                met: skipBehavior ? null : stats.behaviorSLOsAbove2 >= 1,
                label: 'One behavior SLO ≥2.0',
                skip: skipBehavior
            },
            {
                met: (skipPhysics && skipLab) ? null : stats.minSLO >= 1.7,
                label: 'No SLO <1.7',
                skip: skipPhysics && skipLab
            },
            {
                met: !isNA(stats.projectSLOs) && stats.projectSLOs >= 2,
                label: '2/3 of project SLO ≥2.0',
                skip: isNA(stats.projectSLOs)
            },
            {
                met: isNA(stats.conceptMatching) || stats.conceptMatching < 2.0,
                label: '<2.0 on concept matching on final (or N/A)',
                skip: false
            }
        ];

        const relevantB = bRequirements.filter(r => !r.skip);
        if (relevantB.length > 0 && relevantB.every(r => r.met)) {
            return { letter: 'B', requirements: bRequirements, description: 'Good work! You meet all B-level requirements.' };
        }

        // Check for C
        const cRequirements = [
            {
                met: skipPhysics ? null : stats.physicsSLOsAbove2 >= Math.ceil(numPhysics * (6/12)),
                label: skipPhysics ? '1/2 physics SLOs ≥2.0' :
                    numPhysics >= 12 ? '6/12 physics SLOs ≥2.0' : `${Math.ceil(numPhysics * (6/12))}/${numPhysics} physics SLOs ≥2.0`,
                skip: skipPhysics
            },
            {
                met: skipLab ? null : stats.labSLOsAbove2 >= Math.ceil(numLab * (2/5)),
                label: skipLab ? '2/5 lab SLOs ≥2.0' :
                    numLab >= 5 ? '2/5 lab SLOs ≥2.0' : `${Math.ceil(numLab * (2/5))}/${numLab} lab SLOs ≥2.0`,
                skip: skipLab
            },
            {
                met: (skipPhysics && skipLab) ? null : (stats.minPhysicsSLO >= 1.5 && stats.minLabSLO >= 1.5),
                label: 'No physics or lab SLOs <1.5',
                skip: skipPhysics && skipLab
            },
            {
                met: stats.labsMissed <= 3,
                label: 'Missed three labs at most',
                skip: false
            }
        ];

        const relevantC = cRequirements.filter(r => !r.skip);
        if (relevantC.length > 0 && relevantC.every(r => r.met)) {
            return { letter: 'C', requirements: cRequirements, description: 'You meet all C-level requirements.' };
        }

        // Check for D
        const dRequirements = [
            {
                met: skipPhysics ? null : stats.physicsSLOsAbove2 >= Math.ceil(numPhysics * (4/12)),
                label: skipPhysics ? '1/3 physics SLOs ≥2.0' :
                    numPhysics >= 12 ? '4/12 physics SLOs ≥2.0' : `${Math.ceil(numPhysics * (4/12))}/${numPhysics} physics SLOs ≥2.0`,
                skip: skipPhysics
            },
            {
                met: (skipPhysics && skipLab) ? null : (stats.minPhysicsSLO >= 1.3 && stats.minLabSLO >= 1.3),
                label: 'No physics or lab SLOs <1.3',
                skip: skipPhysics && skipLab
            },
            {
                met: skipLab ? null : stats.labSLOsAbove2 >= Math.ceil(numLab * (1/5)),
                label: skipLab ? '1/5 lab SLOs ≥2.0' :
                    numLab >= 5 ? '1/5 lab SLOs ≥2.0' : `${Math.ceil(numLab * (1/5))}/${numLab} lab SLOs ≥2.0`,
                skip: skipLab
            },
            {
                met: stats.labsMissed <= 4,
                label: 'Missed four labs at most',
                skip: false
            }
        ];

        const relevantD = dRequirements.filter(r => !r.skip);
        if (relevantD.length > 0 && relevantD.every(r => r.met)) {
            return { letter: 'D', requirements: dRequirements, description: 'You meet D-level requirements. Consider reviewing material and seeking help.' };
        }

        // F grade - ONE OR MORE of these conditions means F
        const fConditions = [
            {
                met: (skipPhysics && skipLab) ? false : (stats.minPhysicsSLO < 1.3 || stats.minLabSLO < 1.3),
                label: 'Any physics or lab SLO <1.3',
                skip: skipPhysics && skipLab
            },
            {
                met: stats.labsMissed >= 5,
                label: 'Missed 5 or more labs',
                skip: false
            },
            {
                met: skipPhysics ? false : stats.physicsSLOsAbove2 <= Math.ceil(numPhysics * (3/12)),
                label: skipPhysics ? '1/4 or fewer physics SLO ≥2.0' :
                    numPhysics >= 12 ? '3 or fewer physics SLO ≥2.0' : `${Math.ceil(numPhysics * (3/12))} or fewer physics SLO ≥2.0`,
                skip: skipPhysics
            },
            {
                met: skipLab ? false : stats.labSLOsAbove2 === 0,
                label: 'All lab SLO <2.0',
                skip: skipLab
            }
        ];

        // Check if ANY F condition is met (F requires one or more, not all)
        const relevantF = fConditions.filter(r => !r.skip);
        const hasFailingCondition = relevantF.some(r => r.met);

        if (hasFailingCondition) {
            return {
                letter: 'F',
                requirements: fConditions,
                description: 'You have one or more failing conditions. Please speak with your instructor.'
            };
        }

        // If no grade matched, default to the lowest passing grade they qualify for
        // This shouldn't normally happen, but return D as a safe default
        return {
            letter: 'D',
            requirements: dRequirements,
            description: 'Incomplete evaluation - showing D requirements as reference.'
        };
    }

    // Returns requirements for all four letter grades (for the progress grid)
    function getAllGradeRequirements(stats) {
        const isNA = (val) => val === null || val === undefined;
        const numPhysics = stats.totalEvaluatedPhysics;
        const numLab    = stats.totalEvaluatedLab;
        const skipPhysics  = numPhysics === 0;
        const skipLab      = numLab === 0;
        const skipBehavior = isNA(stats.behaviorSLOsAbove2);

        const p2label  = skipPhysics ? 'All physics SLOs ≥2.0' : `All ${numPhysics} physics SLOs ≥2.0`;
        const p25label = skipPhysics ? '2/3 physics SLOs ≥2.5'
            : `${Math.ceil(numPhysics * (8/12))}/${numPhysics} physics SLOs ≥2.5`;

        return {
            A: [
                { label: p2label,  met: skipPhysics ? null : stats.physicsSLOsAbove2 >= numPhysics, skip: skipPhysics },
                { label: p25label, met: skipPhysics ? null : stats.physicsSLOsAbove2_5 >= Math.ceil(numPhysics * (8/12)), skip: skipPhysics },
                { label: skipLab ? '3/4 lab SLOs ≥2.0' : `${Math.ceil(numLab * (3/5))}/${numLab} lab SLOs ≥2.0`, met: skipLab ? null : stats.labSLOsAbove2 >= Math.ceil(numLab * (3/5)), skip: skipLab },
                { label: skipLab ? '2/4 lab SLOs ≥2.5' : `${Math.ceil(numLab * (2/5))}/${numLab} lab SLOs ≥2.5`, met: skipLab ? null : stats.labSLOsAbove2_5 >= Math.ceil(numLab * (2/5)), skip: skipLab },
                { label: 'Missed ≤1 lab', met: stats.labsMissed <= 1, skip: false },
                { label: 'Behavior SLOs ≥2.0', met: skipBehavior ? null : stats.behaviorSLOsAbove2 >= 2, skip: skipBehavior },
                { label: 'All project SLOs ≥2.0', met: !isNA(stats.projectSLOs) && stats.projectSLOs >= 3, skip: isNA(stats.projectSLOs) },
                { label: '1/3 project SLOs =3.0', met: !isNA(stats.projectSLOs3) && stats.projectSLOs3 >= 1, skip: isNA(stats.projectSLOs3) },
                { label: '≥2.0 on concept matching', met: !isNA(stats.conceptMatching) && stats.conceptMatching >= 2.0, skip: isNA(stats.conceptMatching) },
            ],
            B: [
                { label: skipPhysics ? '3/4 physics SLOs ≥2.0' : `${Math.ceil(numPhysics * (9/12))}/${numPhysics} physics SLOs ≥2.0`, met: skipPhysics ? null : stats.physicsSLOsAbove2 >= Math.ceil(numPhysics * (9/12)), skip: skipPhysics },
                { label: skipPhysics ? '1/3 physics SLOs ≥2.5' : `${Math.ceil(numPhysics * (4/12))}/${numPhysics} physics SLOs ≥2.5`, met: skipPhysics ? null : stats.physicsSLOsAbove2_5 >= Math.ceil(numPhysics * (4/12)), skip: skipPhysics },
                { label: skipLab ? '2/5 lab SLOs ≥2.0' : `${Math.ceil(numLab * (2/5))}/${numLab} lab SLOs ≥2.0`, met: skipLab ? null : stats.labSLOsAbove2 >= Math.ceil(numLab * (2/5)), skip: skipLab },
                { label: skipLab ? '1/5 lab SLOs ≥2.5' : `${Math.ceil(numLab * (1/5))}/${numLab} lab SLOs ≥2.5`, met: skipLab ? null : stats.labSLOsAbove2_5 >= Math.ceil(numLab * (1/5)), skip: skipLab },
                { label: 'No SLO <1.7', met: (skipPhysics && skipLab) ? null : stats.minSLO >= 1.7, skip: skipPhysics && skipLab },
                { label: 'Missed ≤2 labs', met: stats.labsMissed <= 2, skip: false },
                { label: '1 behavior SLO ≥2.0', met: skipBehavior ? null : stats.behaviorSLOsAbove2 >= 1, skip: skipBehavior },
                { label: '2/3 project SLOs ≥2.0', met: !isNA(stats.projectSLOs) && stats.projectSLOs >= 2, skip: isNA(stats.projectSLOs) },
            ],
            C: [
                { label: skipPhysics ? '1/2 physics SLOs ≥2.0' : `${Math.ceil(numPhysics * (6/12))}/${numPhysics} physics SLOs ≥2.0`, met: skipPhysics ? null : stats.physicsSLOsAbove2 >= Math.ceil(numPhysics * (6/12)), skip: skipPhysics },
                { label: skipLab ? '2/5 lab SLOs ≥2.0' : `${Math.ceil(numLab * (2/5))}/${numLab} lab SLOs ≥2.0`, met: skipLab ? null : stats.labSLOsAbove2 >= Math.ceil(numLab * (2/5)), skip: skipLab },
                { label: 'No physics/lab SLO <1.5', met: (skipPhysics && skipLab) ? null : stats.minPhysicsSLO >= 1.5 && stats.minLabSLO >= 1.5, skip: skipPhysics && skipLab },
                { label: 'Missed ≤3 labs', met: stats.labsMissed <= 3, skip: false },
            ],
            D: [
                { label: skipPhysics ? '1/3 physics SLOs ≥2.0' : `${Math.ceil(numPhysics * (4/12))}/${numPhysics} physics SLOs ≥2.0`, met: skipPhysics ? null : stats.physicsSLOsAbove2 >= Math.ceil(numPhysics * (4/12)), skip: skipPhysics },
                { label: 'No physics/lab SLO <1.3', met: (skipPhysics && skipLab) ? null : stats.minPhysicsSLO >= 1.3 && stats.minLabSLO >= 1.3, skip: skipPhysics && skipLab },
                { label: skipLab ? '1/5 lab SLOs ≥2.0' : `${Math.ceil(numLab * (1/5))}/${numLab} lab SLOs ≥2.0`, met: skipLab ? null : stats.labSLOsAbove2 >= Math.ceil(numLab * (1/5)), skip: skipLab },
                { label: 'Missed ≤4 labs', met: stats.labsMissed <= 4, skip: false },
            ]
        };
    }

    // Returns array of human-readable strings describing unmet requirements for a target grade
    function getUnmetRequirements(targetGrade, stats) {
        const isNA = (val) => val === null || val === undefined;
        const numPhysics = stats.totalEvaluatedPhysics;
        const numLab = stats.totalEvaluatedLab;
        const unmet = [];

        if (targetGrade === 'A') {
            if (numPhysics > 0) {
                const sf2 = numPhysics - stats.physicsSLOsAbove2;
                if (sf2 > 0) unmet.push(`${sf2} more physics SLO${sf2 > 1 ? 's' : ''} must reach ≥2.0`);
                const need2_5 = Math.ceil(numPhysics * (8 / 12));
                const sf2_5 = need2_5 - stats.physicsSLOsAbove2_5;
                if (sf2_5 > 0) unmet.push(`${sf2_5} more physics SLO${sf2_5 > 1 ? 's' : ''} must reach ≥2.5`);
            }
            if (numLab > 0) {
                const needL2 = Math.ceil(numLab * (3 / 5));
                const sfL2 = needL2 - stats.labSLOsAbove2;
                if (sfL2 > 0) unmet.push(`${sfL2} more lab SLO${sfL2 > 1 ? 's' : ''} must reach ≥2.0`);
                const needL2_5 = Math.ceil(numLab * (2 / 5));
                const sfL2_5 = needL2_5 - stats.labSLOsAbove2_5;
                if (sfL2_5 > 0) unmet.push(`${sfL2_5} more lab SLO${sfL2_5 > 1 ? 's' : ''} must reach ≥2.5`);
            }
            if (stats.labsMissed > 1) unmet.push(`labs missed (${stats.labsMissed}) must be ≤1`);
        } else if (targetGrade === 'B') {
            if (numPhysics > 0) {
                const need2 = Math.ceil(numPhysics * (9 / 12));
                const sf2 = need2 - stats.physicsSLOsAbove2;
                if (sf2 > 0) unmet.push(`${sf2} more physics SLO${sf2 > 1 ? 's' : ''} must reach ≥2.0`);
                const need2_5 = Math.ceil(numPhysics * (4 / 12));
                const sf2_5 = need2_5 - stats.physicsSLOsAbove2_5;
                if (sf2_5 > 0) unmet.push(`${sf2_5} more physics SLO${sf2_5 > 1 ? 's' : ''} must reach ≥2.5`);
            }
            if (!isNA(stats.minSLO) && isFinite(stats.minSLO) && stats.minSLO < 1.7) {
                unmet.push(`raise lowest SLO above 1.7 (currently ${stats.minSLO.toFixed(1)})`);
            }
            if (stats.labsMissed > 2) unmet.push(`labs missed (${stats.labsMissed}) must be ≤2`);
        } else if (targetGrade === 'C') {
            if (numPhysics > 0) {
                const need2 = Math.ceil(numPhysics * (6 / 12));
                const sf2 = need2 - stats.physicsSLOsAbove2;
                if (sf2 > 0) unmet.push(`${sf2} more physics SLO${sf2 > 1 ? 's' : ''} must reach ≥2.0`);
            }
            if (numLab > 0) {
                const needL2 = Math.ceil(numLab * (2 / 5));
                const sfL2 = needL2 - stats.labSLOsAbove2;
                if (sfL2 > 0) unmet.push(`${sfL2} more lab SLO${sfL2 > 1 ? 's' : ''} must reach ≥2.0`);
            }
            if (isFinite(stats.minPhysicsSLO) && stats.minPhysicsSLO < 1.5) {
                unmet.push(`raise lowest physics SLO above 1.5 (currently ${stats.minPhysicsSLO.toFixed(1)})`);
            }
            if (isFinite(stats.minLabSLO) && stats.minLabSLO < 1.5) {
                unmet.push(`raise lowest lab SLO above 1.5 (currently ${stats.minLabSLO.toFixed(1)})`);
            }
            if (stats.labsMissed > 3) unmet.push(`labs missed (${stats.labsMissed}) must be ≤3`);
        } else if (targetGrade === 'D') {
            if (numPhysics > 0) {
                const need2 = Math.ceil(numPhysics * (4 / 12));
                const sf2 = need2 - stats.physicsSLOsAbove2;
                if (sf2 > 0) unmet.push(`${sf2} more physics SLO${sf2 > 1 ? 's' : ''} must reach ≥2.0`);
            }
            if (isFinite(stats.minPhysicsSLO) && stats.minPhysicsSLO < 1.3) {
                unmet.push(`raise lowest physics SLO above 1.3 (currently ${stats.minPhysicsSLO.toFixed(1)})`);
            }
            if (isFinite(stats.minLabSLO) && stats.minLabSLO < 1.3) {
                unmet.push(`raise lowest lab SLO above 1.3 (currently ${stats.minLabSLO.toFixed(1)})`);
            }
            if (stats.labsMissed > 4) unmet.push(`labs missed (${stats.labsMissed}) must be ≤4`);
        }
        return unmet;
    }

    function displayResults(grades, stats, physicsSLOs, labSLOs) {
        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        // Display improvement section (two-tone: urgent vs encouraging)
        const improvementSection = document.getElementById('improvementSection');
        const physicsRemaining = Math.max(0, 15 - CURRENT_WEEK);
        const labRemaining = Math.max(0, 14 - CURRENT_WEEK);
        const gradeLockedIn = grades.best.letter === grades.worst.letter && grades.best.letter !== 'F';

        // --- 1. Urgent: SLOs < 1.3 triggering a failing condition (always shown) ---
        const urgentItems = [];
        physicsSLOs.forEach((score, index) => {
            if (score !== null && score < 1.3 && physicsRemaining > 0) {
                const n = physicsRemaining, w = n === 1 ? 'chance' : 'chances';
                urgentItems.push(
                    `<li><strong>${physicsSLONames[index]}</strong> (score: ${score.toFixed(1)}): ` +
                    `This score is currently triggering a <strong>failing condition</strong> — ` +
                    `bringing it above 1.3 is your first priority. ` +
                    `You still have <strong>${n} ${w}</strong> to improve it.</li>`
                );
            }
        });
        labSLOs.forEach((score, index) => {
            if (score !== null && score < 1.3 && labRemaining > 0) {
                const n = labRemaining, w = n === 1 ? 'chance' : 'chances';
                urgentItems.push(
                    `<li><strong>${labSLONames[index]}</strong> (score: ${score.toFixed(1)}): ` +
                    `This score is currently triggering a <strong>failing condition</strong> — ` +
                    `bringing it above 1.3 is your first priority. ` +
                    `You still have up to <strong>${n} ${w}</strong> to improve it, ` +
                    `and 40% of the grade will come from the practicum.</li>`
                );
            }
        });

        // --- 2. Encouraging: SLOs 1.3–1.99 (only when grade can still improve) ---
        const encouragingItems = [];
        if (!gradeLockedIn) {
            physicsSLOs.forEach((score, index) => {
                if (score !== null && score >= 1.3 && score < 2.0 && physicsRemaining > 0) {
                    const n = physicsRemaining, w = n === 1 ? 'chance' : 'chances';
                    let msg = `<li><strong>${physicsSLONames[index]}</strong> (score: ${score.toFixed(1)}): ` +
                              `You still have <strong>${n} ${w}</strong> to improve this score.`;
                    if (score < 1.5) {
                        msg += ` With Canvas's decaying average, strong future performances count more than early results — don't give up on this one!`;
                    }
                    encouragingItems.push(msg + `</li>`);
                }
            });
            labSLOs.forEach((score, index) => {
                if (score !== null && score >= 1.3 && score < 2.0 && labRemaining > 0) {
                    const n = labRemaining, w = n === 1 ? 'chance' : 'chances';
                    let msg = `<li><strong>${labSLONames[index]}</strong> (score: ${score.toFixed(1)}): ` +
                              `You still have up to <strong>${n} ${w}</strong> to improve, ` +
                              `and 40% of the grade will come from the practicum, so keep on honing your skills!`;
                    if (score < 1.5) {
                        msg += ` With Canvas's decaying average, your next lab session counts more — each one is a fresh start.`;
                    }
                    encouragingItems.push(msg + `</li>`);
                }
            });
        }

        // --- 3. "X SLOs need attention to reach an A" summary ---
        let aSummary = '';
        if (grades.best.letter === 'A' && grades.current.letter !== 'A') {
            const parts = [];
            const physBelow2   = physicsSLOs.filter(s => s !== null && s < 2.0).length;
            const physBelow2_5 = physicsSLOs.filter(s => s !== null && s >= 2.0 && s < 2.5).length;
            const labBelow2    = labSLOs.filter(s => s !== null && s < 2.0).length;
            const labBelow2_5  = labSLOs.filter(s => s !== null && s >= 2.0 && s < 2.5).length;
            if (physBelow2   > 0) parts.push(`${physBelow2} physics SLO${physBelow2 > 1 ? 's' : ''} below 2.0 need to reach ≥2.0`);
            if (physBelow2_5 > 0) parts.push(`${physBelow2_5} physics SLO${physBelow2_5 > 1 ? 's' : ''} between 2.0–2.5 could be pushed to ≥2.5`);
            if (labBelow2    > 0) parts.push(`${labBelow2} lab SLO${labBelow2 > 1 ? 's' : ''} below 2.0 need attention`);
            if (labBelow2_5  > 0) parts.push(`${labBelow2_5} lab SLO${labBelow2_5 > 1 ? 's' : ''} between 2.0–2.5 could reach ≥2.5`);
            if (parts.length > 0) {
                aSummary = `<p>🎯 <strong>Path to an A:</strong> Among your graded SLOs — ${parts.join('; ')}.</p>`;
            }
        }

        // --- 4. Specific grade-distance message (what's needed for next grade up) ---
        let gradeDistanceMsg = '';
        if (!gradeLockedIn) {
            const gradeOrder = ['A', 'B', 'C', 'D', 'F'];
            const currentIdx = gradeOrder.indexOf(grades.current.letter);
            const bestIdx    = gradeOrder.indexOf(grades.best.letter);
            if (bestIdx < currentIdx && currentIdx > 0) {
                const targetGrade = gradeOrder[currentIdx - 1];
                const unmet = getUnmetRequirements(targetGrade, stats.current);
                if (unmet.length > 0) {
                    gradeDistanceMsg = `<p>📈 <strong>Path to a ${targetGrade}:</strong> Based on your current scores: ${unmet.join('; ')}.</p>`;
                }
            }
        }

        // --- 5. Missed labs warning ---
        let labsMissedWarning = '';
        const lm = stats.current.labsMissed;
        if (lm >= 4) {
            labsMissedWarning = `<p>🚨 <strong>Lab attendance critical:</strong> You've missed ${lm} lab${lm > 1 ? 's' : ''} — one more missed lab triggers an F condition. Attendance is essential!</p>`;
        } else if (lm === 3) {
            labsMissedWarning = `<p>⚠️ <strong>Lab attendance:</strong> You've missed 3 labs. Missing any more puts your C-level standing at risk.</p>`;
        } else if (lm === 2) {
            labsMissedWarning = `<p>⚠️ <strong>Lab attendance:</strong> You've missed 2 labs — at the B-grade limit. One more missed lab would affect your grade.</p>`;
        } else if (lm === 1) {
            labsMissedWarning = `<p>💡 <strong>Lab attendance:</strong> You've missed 1 lab. To stay on track for an A, don't miss any more.</p>`;
        }

        // --- 6. Worst-case-still-passing encouragement ---
        let worstCaseMsg = '';
        if (!gradeLockedIn && grades.worst.letter !== 'F') {
            worstCaseMsg = `<p>✅ <strong>Solid foundation:</strong> Even if all your remaining SLOs score 0.0, you're on track to pass with at least a <strong>${grades.worst.letter}</strong>.</p>`;
        }

        // --- Assemble the section ---
        const hasContent = urgentItems.length > 0 || encouragingItems.length > 0 ||
                           aSummary || gradeDistanceMsg || labsMissedWarning || worstCaseMsg;
        if (hasContent) {
            let html = '';
            if (urgentItems.length > 0) {
                html += `
                <div style="margin: 12px 0; padding: 14px 16px; background: rgba(244,67,54,0.08); border-left: 4px solid #f44336; border-radius: 6px;">
                    <strong>🚨 Urgent — Failing Conditions to Address:</strong>
                    <ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.9;">${urgentItems.join('')}</ul>
                </div>`;
            }
            if (encouragingItems.length > 0) {
                html += `
                <div style="margin: 12px 0; padding: 14px 16px; background: rgba(76,175,80,0.08); border-left: 4px solid #4caf50; border-radius: 6px;">
                    <strong>💡 Opportunities to Improve:</strong>
                    <ul style="margin: 8px 0 0 0; padding-left: 20px; line-height: 1.9;">${encouragingItems.join('')}</ul>
                </div>`;
            }
            const infoItems = [aSummary, gradeDistanceMsg, labsMissedWarning, worstCaseMsg].filter(Boolean);
            if (infoItems.length > 0) {
                html += `
                <div style="margin: 12px 0; padding: 14px 16px; background: rgba(33,150,243,0.08); border-left: 4px solid #2196f3; border-radius: 6px;">
                    ${infoItems.join('')}
                </div>`;
            }
            improvementSection.innerHTML = html;
            improvementSection.style.display = 'block';
        } else {
            improvementSection.innerHTML = '';
            improvementSection.style.display = 'none';
        }

        // Display A/B/C/D grade progress grid
        const checklistContainer = document.getElementById('checklistContainer');
        const allReqs = getAllGradeRequirements(stats.current);
        const gradeConfig = {
            A: { color: '#2e7d32', border: '#4caf50', bg: 'rgba(76,175,80,0.07)'  },
            B: { color: '#1565c0', border: '#2196f3', bg: 'rgba(33,150,243,0.07)' },
            C: { color: '#e65100', border: '#ff9800', bg: 'rgba(255,152,0,0.07)'  },
            D: { color: '#424242', border: '#9e9e9e', bg: 'rgba(158,158,158,0.07)'}
        };

        let gridHtml = '<h3 style="margin-top:0; margin-bottom:14px; border:none; padding:0; font-size:1.1rem; color:#555;">Requirements Progress</h3>';
        gridHtml += '<div style="display:grid; grid-template-columns:repeat(auto-fit,minmax(210px,1fr)); gap:14px;">';

        for (const grade of ['A', 'B', 'C', 'D']) {
            const reqs = allReqs[grade];
            const cfg  = gradeConfig[grade];
            const relevant  = reqs.filter(r => !r.skip);
            const metCount  = relevant.filter(r => r.met).length;
            const total     = relevant.length;
            const allMet    = total > 0 && metCount === total;
            const cardBg    = allMet ? cfg.bg  : '#fff';
            const cardBorder= allMet ? cfg.border : '#ddd';
            const badgeBg   = allMet ? cfg.border : '#eee';
            const badgeText = allMet ? '#fff' : '#666';

            gridHtml += `
                <div style="background:${cardBg}; border:2px solid ${cardBorder}; border-radius:10px; padding:14px 16px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px; padding-bottom:8px; border-bottom:1px solid #e0e0e0;">
                        <span style="font-size:1.35rem; font-weight:700; color:${cfg.color};">Grade ${grade}</span>
                        <span style="font-size:0.8rem; font-weight:600; padding:2px 9px; border-radius:10px; background:${badgeBg}; color:${badgeText};">
                            ${allMet ? '✓ Met' : `${metCount}/${total}`}
                        </span>
                    </div>
                    <ul style="list-style:none; padding:0; margin:0; font-size:0.87rem; line-height:1.8;">
                        ${reqs.map(r => {
                            if (r.skip) return `<li style="color:#bbb;">○ ${r.label} <em style="font-size:0.8em;">(pending)</em></li>`;
                            return `<li style="color:${r.met ? '#2e7d32' : '#c62828'};">${r.met ? '✓' : '✗'} ${r.label}</li>`;
                        }).join('')}
                    </ul>
                </div>`;
        }

        gridHtml += '</div>';
        checklistContainer.innerHTML = gridHtml;

        // Display summary statistics
        const summaryStats = document.getElementById('summaryStats');
        summaryStats.innerHTML = `
            <h3>Your Performance Summary</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-value">${stats.current.physicsSLOsAbove2}/${stats.current.totalEvaluatedPhysics}</div>
                    <div class="stat-label">Physics SLOs ≥2.0</div>
                    <div class="stat-label" style="font-size: 0.8rem; margin-top: 5px;">(out of 13 total)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.current.physicsSLOsAbove2_5}/${stats.current.totalEvaluatedPhysics}</div>
                    <div class="stat-label">Physics SLOs ≥2.5</div>
                    <div class="stat-label" style="font-size: 0.8rem; margin-top: 5px;">(out of 13 total)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.current.labSLOsAbove2}/${stats.current.totalEvaluatedLab}</div>
                    <div class="stat-label">Lab SLOs ≥2.0</div>
                    <div class="stat-label" style="font-size: 0.8rem; margin-top: 5px;">(out of 4 total)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.current.labSLOsAbove2_5}/${stats.current.totalEvaluatedLab}</div>
                    <div class="stat-label">Lab SLOs ≥2.5</div>
                    <div class="stat-label" style="font-size: 0.8rem; margin-top: 5px;">(out of 4 total)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.current.labsMissed}</div>
                    <div class="stat-label">Labs Missed</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${isFinite(stats.current.minSLO) ? stats.current.minSLO.toFixed(1) : 'N/A'}</div>
                    <div class="stat-label">Lowest SLO Score</div>
                </div>
            </div>
        `;
    }

    function resetForm() {
        // Reset all number inputs and re-enable them
        document.querySelectorAll('input[type="number"]').forEach(input => {
            input.value = '';
            input.disabled = true; // Disable by default since N/A will be checked
        });

        // Check all N/A checkboxes by default
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });

        // Set defaults for labs missed (not disabled)
        document.getElementById('labsMissed').value = '0';
        document.getElementById('labsMissed').disabled = false;

        // Hide results
        resultsSection.style.display = 'none';
        const improvSec = document.getElementById('improvementSection');
        if (improvSec) { improvSec.style.display = 'none'; improvSec.innerHTML = ''; }

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});
