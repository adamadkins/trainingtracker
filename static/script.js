function openForm() {
    // Show the overlay and form
    document.getElementById("overlay").style.display = "block";
    document.getElementById("myForm").style.display = "block";
}

function closeForm() {
    // Hide the overlay and form
    document.getElementById("overlay").style.display = "none";
    document.getElementById("myForm").style.display = "none";
}


// When the user clicks anywhere outside the modal, close it
window.addEventListener('click', function (event) {
    let modal = document.getElementById('myForm');
    if (event.target === modal) {
        closeForm();
    }
});

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded and parsed');

    const saveProgressButtons = document.querySelectorAll('.saveProgressButton');
    console.log('Number of buttons found:', saveProgressButtons.length);

    saveProgressButtons.forEach(function(button, index) {
        console.log('Button index:', index, button);
        if (button) {
            button.addEventListener('click', function(event) {
                event.preventDefault();
                event.stopPropagation();
                console.log('Button clicked:', index);
                location.reload();
            });
        } else {
            console.error('Save Progress button not found at index:', index);
        }
    });
});
function toggleCollapse(elementId) {
    var content = document.getElementById(elementId);
    if (content.style.display === 'none' || content.style.display === '') {
        content.style.display = 'block';
        localStorage.setItem(elementId, 'expanded');
    } else {
        content.style.display = 'none';
        localStorage.setItem(elementId, 'collapsed');
    }
}

window.addEventListener('load', () => {
    var collapsibleSections = document.querySelectorAll('.content');
    collapsibleSections.forEach(section => {
        var state = localStorage.getItem(section.id);
        if (state === 'expanded') {
            section.style.display = 'block';
        } else {
            section.style.display = 'none';
        }
    });
});


function deleteTeamMember(memberId) {
    // Use a confirmation dialog to confirm the deletion
    const confirmDelete = confirm("Are you sure you want to delete this team member?");

    if (confirmDelete) {
        // Make a fetch request to your Flask endpoint to delete the team member
        fetch(`/delete_member/${memberId}`, {
            method: 'DELETE',
        })
            .then(response => {
                if (response.ok) {
                    // Clear local storage for the deleted team member
                    clearLocalStorageForMember(memberId);
                    // Optionally, update the UI or reload the page
                    location.reload();
                } else {
                    console.error('Failed to delete team member:', response.statusText);
                }
            })
            .catch(error => console.error('Delete request failed:', error));
    }
}



function clearLocalStorageForMember(memberId) {
    // Loop through all sliders and remove local storage data for the deleted member
    const sliders = document.querySelectorAll('.slider');
    sliders.forEach(slider => {
        const newHireId = slider.closest('.qualities').dataset.newHireId;
        const positionId = slider.closest('.qualities').dataset.positionId;
        localStorage.removeItem(`${newHireId}-${positionId}-sliderValue`);
    });
}

function updateOverallProgress(inputElement) {
    const newHireId = inputElement.closest('.qualities').dataset.newHireId;
    const positionId = inputElement.closest('.qualities').dataset.positionId;
    const listId = inputElement.getAttribute('list');
    const sliderId = inputElement.id;
    const key = `sliderValue-${sliderId}`;
    console.log(`Updating slider ${sliderId} with value ${inputElement.value}`);


    console.log(`Updating overall progress for ${newHireId}-${positionId} with slider value ${inputElement.value}`);

    const overallProgressElement = document.querySelector(`#overallProgress${newHireId}-${positionId}-qualities`);
    if (overallProgressElement) {
        console.log(`Found overall progress element: ${overallProgressElement.id}`);

        const qualityElements = document.querySelectorAll(`[data-new-hire-id='${newHireId}'][data-position-id='${positionId}'] .quality`);
        console.log(`Found ${qualityElements.length} quality elements`);

        const totalPercentage = Array.from(qualityElements).reduce((total, element) => {
            const qualityValue = (parseFloat(element.previousElementSibling.value) - 1) * 25;
            element.textContent = getQualityText(element.previousElementSibling.value);
            return total + qualityValue;
        }, 0);

        const averagePercentage = totalPercentage / qualityElements.length;
        console.log(`Average Percentage: ${averagePercentage}`);
        overallProgressElement.textContent = `${averagePercentage.toFixed(2)}%`;
        overallProgressElement.style.color = getColorForPercentage(averagePercentage);

        updateOverallProgressInDatabase(newHireId, positionId, averagePercentage);
    } else {
        console.error(`Overall progress element not found for ${newHireId}-${positionId}-qualities`);
    }
    fetch(`/get_overall_progress/${newHireId}`) // Replace with the correct new hire ID
        .then(response => response.json())
        .then(data => {
            if (data.average_percentage !== undefined) {
                document.getElementById("averageProgress").innerHTML = `Overall Progress: ${data.average_percentage}%`;
            } else {
                null;
            }
        })
        .catch(error => console.error('Error:', error));
    fetch(`/save_slider_value/${sliderId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value: inputElement.value }),
    })
    .then(response => {
        if (response.ok) {
            console.log('Slider value saved successfully for slider ID:', sliderId);
        } else {
            console.error('Failed to save slider value for slider ID:', sliderId);
        }
    })
    .catch(error => console.error('Error saving slider value for slider ID:', sliderId, error));
}

function updateOverallProgressInDatabase(newHireId, positionId, averagePercentage) {
    fetch(`/update_progress/${newHireId}/${positionId}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `progress=${averagePercentage}`,
    })
        .then(response => {
            console.log('Update successful:', response);
            updateUIWithData(response);
        })
        .then(data => {
            console.log('Update successful:', data);
            // Assume you have logic to update UI with data
            updateUIWithData(data);
        })
        .catch(error => console.error('Update failed:', error));
}

window.addEventListener('load', () => {
    // Load slider values for each slider
    document.querySelectorAll('.slider').forEach(slider => {
        const sliderId = slider.id;
        fetch(`/get_slider_value/${sliderId}`)
            .then(response => response.json())
            .then(data => {
                if (data.value !== undefined) {
                    slider.value = data.value;

                    // Find the corresponding quality <span> element using data-quality-id
                    const qualityElement = document.querySelector(`[data-quality-id="${sliderId}"]`);
                    if (qualityElement) {
                        qualityElement.innerText = data.quality_text; // Update the quality text
                    }
                }
            })
            .catch(error => console.error('Error fetching slider value:', error));
    });
});


document.getElementById('downloadExcel').addEventListener('click', function() {
    window.location.href = '/run_excel_output';
});




function getQualityText(sliderValue) {
    const qualityTexts = ["Needs Work", "Below Average", "Average", "Above Average", "Excellent"];
    return qualityTexts[sliderValue - 1];
}

function updateUIWithData(data) {
    // Assume you have logic to update the UI based on the server response
    console.log('Update UI with data:', data);
}

function getColorForPercentage(percentage) {
    if (percentage >= 0 && percentage <= 50) {
        return '#D60206';
    } else if (percentage >= 51 && percentage <= 69) {
        return 'orange';
    } else if (percentage >= 70 && percentage <= 79) {
        return '#afa500';
    } else if (percentage >= 80 && percentage <= 100) {
        return '#4ed602';
    } else {
        return 'black';
    }
}


const img = document.querySelector("img");
img.ondragstart = () => {
    return false;
};

