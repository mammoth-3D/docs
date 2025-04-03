document.addEventListener("DOMContentLoaded", function () {
    function updateBeltWidthOptions() {
        let beltType = document.getElementById("beltType").value;
        let beltWidth = document.getElementById("beltWidth");

        // Clear existing options
        beltWidth.innerHTML = "";

        if (beltType === "GT2") {
            beltWidth.innerHTML = `
                <option value="6">6 mm</option>
                <option value="9">9 mm</option>
                <option value="10">10 mm</option>
                <option value="12">12 mm</option>
            `;
        } else if (beltType === "GT3") {
            beltWidth.innerHTML = `
                <option value="6">6 mm</option>
                <option value="9">9 mm</option>
            `;
        }
    }

    function calculateBeltFrequency() {
        let beltType = document.getElementById("beltType").value;
        let beltWidth = document.getElementById("beltWidth").value;
        let factor = parseFloat(document.getElementById("factor").value);
        let length = parseFloat(document.getElementById("beltLength").value) / 1000; // Convert mm to meters
        let resultDisplay = document.getElementById("result");

        if (isNaN(length) || length <= 0) {
            resultDisplay.innerText = "Error: Please enter a valid belt length.";
            return;
        }

        // Define belt data for GT2 and GT3
        const beltData = {
            "GT2-6": { density: 0.0091, factorBase: 4 },
            "GT2-9": { density: 0.0136, factorBase: 6 },
            "GT2-10": { density: 0.0151, factorBase: 7 },
            "GT2-12": { density: 0.0181, factorBase: 8 },
            "GT3-6": { density: 0.0111, factorBase: 10, width: 6.03 }, // Adjusted
            "GT3-9": { density: 0.0166, factorBase: 17, width: 9.03 }  // Adjusted
        };

        let key = `${beltType}-${beltWidth}`;
        if (!beltData[key]) {
            resultDisplay.innerText = "Error: Invalid belt selection.";
            return;
        }

        let beltDensity = beltData[key].density;
        let tensionFactor = beltData[key].factorBase * factor; 

        // Convert tension factor to Newtons (1 lbf = 4.44857143 N)
        let tensionNewton = tensionFactor * 4.44857143;

        // Convert Newtons to lbf (1 N = 0.224809 lbf)
        let tensionLbf = tensionNewton * 0.224809; 

        // ✅ Corrected formula for frequency in Hz
        let frequencyHz = (1 / (2 * length)) * Math.sqrt(tensionNewton / beltDensity);

        // ✅ Debugging: Log values to console
        console.log("Belt Type:", beltType);
        console.log("Belt Width (Adjusted for GT3):", beltData[key].width || beltWidth);
        console.log("Factor:", factor);
        console.log("Belt Length (m):", length);
        console.log("Belt Density:", beltDensity);
        console.log("Tension Factor:", tensionFactor);
        console.log("Tension (N):", tensionNewton);
        console.log("Tension (lbf):", tensionLbf);
        console.log("Calculated Frequency (Hz):", frequencyHz);

        resultDisplay.innerText = `Calculated Belt Frequency: ${frequencyHz.toFixed(2)} Hz | Tension: ${tensionLbf.toFixed(2)} lbf`;
    }

    // Update belt width options when belt type changes
    document.getElementById("beltType").addEventListener("change", updateBeltWidthOptions);
    document.getElementById("calculate").addEventListener("click", calculateBeltFrequency);

    // Initialize belt width options on page load
    updateBeltWidthOptions();
});
