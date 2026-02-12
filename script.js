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
            totalPhysics: 12,
            totalLab: 5
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
            totalEvaluatedPhysics: 12,
            totalEvaluatedLab: 5,
            totalPhysics: 12,
            totalLab: 5
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
            totalEvaluatedPhysics: 12,
            totalEvaluatedLab: 5,
            totalPhysics: 12,
            totalLab: 5
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

    function displayResults(grades, stats, physicsSLOs, labSLOs) {
        // Show results section
        resultsSection.style.display = 'block';
        resultsSection.scrollIntoView({ behavior: 'smooth' });

        // Calculate completion percentage
        const totalSLOs = 12 + 5; // physics + lab
        const evaluatedSLOs = stats.current.totalEvaluatedPhysics + stats.current.totalEvaluatedLab;
        const completionPercent = Math.round((evaluatedSLOs / totalSLOs) * 100);

        // Display progress indicator
        const progressIndicator = document.getElementById('progressIndicator');
        progressIndicator.textContent = `${completionPercent}% of SLOs Evaluated (${evaluatedSLOs}/${totalSLOs})`;

        // Display current grade
        document.getElementById('gradeLetter').textContent = grades.current.letter;
        document.getElementById('gradeDescription').textContent = grades.current.description;

        // Display projection info
        const projectionInfo = document.getElementById('projectionInfo');
        if (completionPercent < 100) {
            const projClass = grades.best.letter === grades.worst.letter ? 'projection-best' : '';
            projectionInfo.className = `projection-info ${projClass}`;
            projectionInfo.innerHTML = `
                <h3>📊 Grade Projections (${100 - completionPercent}% of SLOs remaining)</h3>
                ${grades.best.letter === grades.worst.letter ?
                    `<p><strong>Your grade will be: ${grades.best.letter}</strong> (regardless of remaining SLO scores)</p>` :
                    `<p><strong>Best case scenario:</strong> ${grades.best.letter} (if all remaining SLOs = 3.0)</p>
                     <p><strong>Worst case scenario:</strong> ${grades.worst.letter} (if all remaining SLOs = 0.0)</p>
                     <p><strong>Current trajectory:</strong> ${grades.current.letter} (based only on evaluated SLOs)</p>`
                }
            `;
            projectionInfo.style.display = 'block';
        } else {
            projectionInfo.style.display = 'none';
        }

        // Display current grade checklist
        const checklistContainer = document.getElementById('checklistContainer');
        const allMet = grades.current.requirements.filter(r => !r.skip).every(r => r.met);

        checklistContainer.innerHTML = `
            <div class="checklist ${allMet ? 'met' : 'not-met'}">
                <div class="checklist-header">
                    <div class="checklist-title">Grade ${grades.current.letter} Requirements</div>
                    <div class="checklist-status ${allMet ? 'met' : 'not-met'}">
                        ${allMet ? '✓ All Met' : '○ In Progress'}
                    </div>
                </div>
                <div class="checklist-items">
                    ${grades.current.requirements.map(req => {
                        if (req.skip) {
                            return `
                                <div class="checklist-item" style="opacity: 0.5;">
                                    <span class="checklist-icon">○</span>
                                    <span>${req.label} <em>(Not yet evaluated)</em></span>
                                </div>
                            `;
                        }
                        return `
                            <div class="checklist-item ${req.met ? 'met' : 'not-met'}">
                                <span class="checklist-icon ${req.met ? 'met' : 'not-met'}">
                                    ${req.met ? '✓' : '✗'}
                                </span>
                                <span>${req.label}</span>
                            </div>
                        `;
                    }).join('')}
                </div>
            </div>
        `;

        // Display summary statistics
        const summaryStats = document.getElementById('summaryStats');
        summaryStats.innerHTML = `
            <h3>Your Performance Summary</h3>
            <div class="stat-grid">
                <div class="stat-item">
                    <div class="stat-value">${stats.current.physicsSLOsAbove2}/${stats.current.totalEvaluatedPhysics}</div>
                    <div class="stat-label">Physics SLOs ≥2.0</div>
                    <div class="stat-label" style="font-size: 0.8rem; margin-top: 5px;">(out of 12 total)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.current.physicsSLOsAbove2_5}/${stats.current.totalEvaluatedPhysics}</div>
                    <div class="stat-label">Physics SLOs ≥2.5</div>
                    <div class="stat-label" style="font-size: 0.8rem; margin-top: 5px;">(out of 12 total)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.current.labSLOsAbove2}/${stats.current.totalEvaluatedLab}</div>
                    <div class="stat-label">Lab SLOs ≥2.0</div>
                    <div class="stat-label" style="font-size: 0.8rem; margin-top: 5px;">(out of 5 total)</div>
                </div>
                <div class="stat-item">
                    <div class="stat-value">${stats.current.labSLOsAbove2_5}/${stats.current.totalEvaluatedLab}</div>
                    <div class="stat-label">Lab SLOs ≥2.5</div>
                    <div class="stat-label" style="font-size: 0.8rem; margin-top: 5px;">(out of 5 total)</div>
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

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
});
