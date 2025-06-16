let treeData = null;
let mainSvg = null;
let chartGroup = null;
let width = 1000;
let height = 600;
let margin = { top: 20, right: 90, bottom: 30, left: 90 };
let currentPersonId = null;
let searchTimeout = null;
let d3Zoom = null;
let currentZoomTransform = d3.zoomIdentity;
let currentUser = null;

function initTree() {
    const container = document.getElementById('tree-container');
    if (!container) {
        throw new Error('Tree container not found');
    }

    // Clear any existing SVG
    d3.select("#tree-container").selectAll("*").remove();

    // Create SVG element with explicit dimensions
    mainSvg = d3.select("#tree-container")
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", "0 0 1000 800");  // Added viewBox for proper scaling

    // Append a group element to the SVG for all tree content
    chartGroup = mainSvg.append("g")
        .attr("transform", "translate(50,50)");  // Add initial padding

    // Add zoom behavior
    d3Zoom = d3.zoom()
        .scaleExtent([0.2, 2.5])
        .on("zoom", (event) => {
            chartGroup.attr("transform", event.transform);
            currentZoomTransform = event.transform;
        });

    // Apply zoom behavior and set initial zoom
    mainSvg.call(d3Zoom)
        .on("dblclick.zoom", null);  // Disable default double-click zoom

    // Set initial zoom to fit the content
    const initialTransform = d3.zoomIdentity
        .translate(50, 50)
        .scale(0.8);
    mainSvg.call(d3Zoom.transform, initialTransform);
}

function setZoom(scaleDelta) {
    // Get the current transform directly from the SVG node, as user might have manually panned/zoomed
    const currentTransform = d3.zoomTransform(mainSvg.node());

    let newScale = currentTransform.k + scaleDelta;
    newScale = Math.max(0.2, Math.min(2.5, newScale)); // Clamp scale within defined extent

    // Create a new transform based on current position and new scale
    const newTransform = d3.zoomIdentity
        .translate(currentTransform.x, currentTransform.y)
        .scale(newScale);
    
    // Apply the new transform with a transition
    mainSvg.transition().duration(250).call(d3Zoom.transform, newTransform);
}

// Global error handler
window.onerror = function(msg, url, lineNo, columnNo, error) {
    console.error('Global error:', msg, 'at', url, ':', lineNo);
    return false;
};

// Utility functions
function showError(message) {
    alert(message);
}

function validateDate(dateStr) {
    if (!dateStr) return true; // Optional field
    const date = new Date(dateStr);
    return date instanceof Date && !isNaN(date);
}

function validateEmail(email) {
    if (!email) return true; // Optional field
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhoneNumber(phone) {
    if (!phone) return true; // Optional field
    const re = /^\+?[\d\s-]{10,}$/;
    return re.test(phone);
}

// Form validation
function validatePersonForm(form) {
    const firstName = form.firstName.value.trim();
    const lastName = form.lastName.value.trim();
    const dateOfBirth = form.dateOfBirth.value;
    const gender = form.gender.value;
    const email = form.email.value.trim();
    const phoneNumber = form.phoneNumber.value.trim();
    const dateOfDeath = form.dateOfDeath.value;

    if (!firstName) {
        showError('First name is required');
        return false;
    }
    if (!lastName) {
        showError('Last name is required');
        return false;
    }
    if (!dateOfBirth) {
        showError('Date of birth is required');
        return false;
    }
    if (!validateDate(dateOfBirth)) {
        showError('Invalid date of birth');
        return false;
    }
    if (dateOfDeath && !validateDate(dateOfDeath)) {
        showError('Invalid date of death');
        return false;
    }
    if (!gender) {
        showError('Gender is required');
        return false;
    }
    if (email && !validateEmail(email)) {
        showError('Invalid email address');
        return false;
    }
    if (phoneNumber && !validatePhoneNumber(phoneNumber)) {
        showError('Invalid phone number');
        return false;
    }

    return true;
}

function openAddPersonModal() {
    try {
        const modal = document.getElementById('addPersonModal');
        if (!modal) {
            throw new Error('Modal element not found');
        }
        
        modal.style.display = 'block';
        document.querySelector('.modal-content h2').textContent = 'Add New Person';
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.textContent = 'Add Person';
        }
        
        const form = document.getElementById('addPersonForm');
        if (form) {
            form.reset();
            // Explicitly clear parent search fields and hidden IDs when opening for new person
            document.getElementById('fatherSearch').value = '';
            document.getElementById('fatherId').value = '';
            document.getElementById('fatherSuggestions').style.display = 'none';
            document.getElementById('motherSearch').value = '';
            document.getElementById('motherId').value = '';
            document.getElementById('motherSuggestions').style.display = 'none';
        }
        
        console.log('openAddPersonModal - after reset and explicit clear:');
        console.log('  fatherSearch.value:', document.getElementById('fatherSearch').value);
        console.log('  fatherId.value:', document.getElementById('fatherId').value);
        console.log('  motherSearch.value:', document.getElementById('motherSearch').value);
        console.log('  motherId.value:', document.getElementById('motherId').value);
        
        // loadParentOptions(); // This function is deprecated as we are now using search inputs.
    } catch (error) {
        console.error('Error opening modal:', error);
        showError('Error opening form. Please try again.');
    }
}

function openEditPersonModal(person) {
    try {
        if (!person || !person.id) {
            throw new Error('Invalid person data');
        }
        
        currentPersonId = person.id;
        const modal = document.getElementById('addPersonModal');
        if (!modal) {
            throw new Error('Modal element not found');
        }
        
        modal.style.display = 'block';
        document.querySelector('.modal-content h2').textContent = 'Edit Person';
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.textContent = 'Update';
        }
        
        const form = document.getElementById('addPersonForm');
        if (!form) {
            throw new Error('Form element not found');
        }
        
        // Fill form with person's data
        form.firstName.value = person.firstName || '';
        form.lastName.value = person.lastName || '';
        form.dateOfBirth.value = person.dateOfBirth || '';
        form.dateOfDeath.value = person.dateOfDeath || '';
        form.gender.value = person.gender ? person.gender.toUpperCase() : ''; // Ensure uppercase for select
        form.email.value = person.email || '';
        form.phoneNumber.value = person.phoneNumber || '';
        form.address.value = person.address || '';
        form.gotra.value = person.gotra || '';
        
        // Set father and mother search fields and hidden IDs using fatherId/Name and motherId/Name
        const fatherSearchInput = document.getElementById('fatherSearch');
        const motherSearchInput = document.getElementById('motherSearch');
        const fatherIdHidden = document.getElementById('fatherId');
        const motherIdHidden = document.getElementById('motherId');

        if (person.fatherId && person.fatherName) {
            if (fatherSearchInput) fatherSearchInput.value = person.fatherName;
            if (fatherIdHidden) fatherIdHidden.value = person.fatherId;
        } else {
            if (fatherSearchInput) fatherSearchInput.value = '';
            if (fatherIdHidden) fatherIdHidden.value = '';
        }
        if (person.motherId && person.motherName) {
            if (motherSearchInput) motherSearchInput.value = person.motherName;
            if (motherIdHidden) motherIdHidden.value = person.motherId;
        } else {
            if (motherSearchInput) motherSearchInput.value = '';
            if (motherIdHidden) motherIdHidden.value = '';
        }

    } catch (error) {
        console.error('Error opening edit modal:', error);
        showError('Error opening edit form. Please try again.');
    }
}

function closeAddPersonModal() {
    try {
        const modal = document.getElementById('addPersonModal');
        if (!modal) {
            throw new Error('Modal element not found');
        }
        
        modal.style.display = 'none';
        const form = document.getElementById('addPersonForm');
        if (form) {
            form.reset();
            // Explicitly clear parent search fields and hidden IDs
            document.getElementById('fatherSearch').value = '';
            document.getElementById('fatherId').value = '';
            document.getElementById('fatherSuggestions').style.display = 'none';
            document.getElementById('motherSearch').value = '';
            document.getElementById('motherId').value = '';
            document.getElementById('motherSuggestions').style.display = 'none';
        }
        currentPersonId = null;
        
        document.querySelector('.modal-content h2').textContent = 'Add New Person';
        const submitButton = document.querySelector('.submit-button');
        if (submitButton) {
            submitButton.textContent = 'Add Person';
        }
    } catch (error) {
        console.error('Error closing modal:', error);
        showError('Error closing form. Please try again.');
    }
}

async function loadParentOptions() {
    // This function is no longer needed in its original form as we are now using search inputs.
    // Keep it as a placeholder if there are other calls to it that might need refactoring.
}

async function handleParentSearchInput(event, parentType) {
    const searchTerm = event.target.value.trim();
    const suggestionsDiv = document.getElementById(`${parentType}Suggestions`);
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    if (!searchTerm) {
        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'none';
        }
        const hiddenIdInput = document.getElementById(`${parentType}Id`);
        if (hiddenIdInput) {
            hiddenIdInput.value = '';
        }
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        try {
            const response = await fetch(`http://localhost:8081/api/persons/search?query=${encodeURIComponent(searchTerm)}`, {
                headers: {
                    ...getHeaders(),
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new TypeError("Response was not JSON");
            }
            
            const persons = await response.json();
            if (!Array.isArray(persons)) {
                throw new Error('Invalid response format');
            }
            
            if (suggestionsDiv) {
                if (persons.length > 0) {
                    suggestionsDiv.innerHTML = persons.map(person => {
                        if (!person || !person.id || !person.firstName || !person.lastName) {
                            return '';
                        }
                        
                        const fullName = `${person.firstName} ${person.lastName}`;
                        const fatherName = person.fatherName ? person.fatherName : 'Not specified';
                        const gotra = person.gotra || '';
                        
                        return `
                            <div class="suggestion-item" onclick="selectParent(${person.id}, '${fullName.replace(/'/g, "\'")}', '${parentType}')">
                                <div class="name">${fullName}</div>
                                <div class="details">
                                    Father: ${fatherName}
                                    ${gotra ? ` | Gotra: ${gotra}` : ''}
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    suggestionsDiv.innerHTML = '<div class="suggestion-item">No results found</div>';
                }
                suggestionsDiv.style.display = 'block';
            }
        } catch (error) {
            console.error(`Error fetching ${parentType} suggestions:`, error);
            if (suggestionsDiv) {
                if (error.name === 'AbortError') {
                    suggestionsDiv.innerHTML = '<div class="suggestion-item error">Request timed out</div>';
                } else {
                    suggestionsDiv.innerHTML = '<div class="suggestion-item error">Error loading suggestions</div>';
                }
                suggestionsDiv.style.display = 'block';
            }
        }
    }, 300);
}

function selectParent(personId, personName, parentType) {
    const searchInput = document.getElementById(`${parentType}Search`);
    const hiddenIdInput = document.getElementById(`${parentType}Id`);
    const suggestionsDiv = document.getElementById(`${parentType}Suggestions`);
    
    if (searchInput) {
        searchInput.value = personName;
    }
    if (hiddenIdInput) {
        hiddenIdInput.value = personId;
    }
    if (suggestionsDiv) {
        suggestionsDiv.style.display = 'none';
    }
}

async function handleAddPerson(event) {
    event.preventDefault();
    
    const form = document.getElementById('addPersonForm');
    const formData = new FormData(form);
    
    // Create request object matching PersonRequest DTO
    const personData = {
        firstName: formData.get('firstName'),
        lastName: formData.get('lastName'),
        dateOfBirth: formData.get('dateOfBirth'),
        dateOfDeath: formData.get('dateOfDeath') || null,
        gender: formData.get('gender'),
        email: formData.get('email') || null,
        phoneNumber: formData.get('phoneNumber') || null,
        address: formData.get('address') || null,
        gotra: formData.get('gotra'),
        fatherId: formData.get('fatherId') ? parseInt(formData.get('fatherId')) : null,
        motherId: formData.get('motherId') ? parseInt(formData.get('motherId')) : null
    };

    const url = currentPersonId 
        ? `http://localhost:8081/api/persons/${currentPersonId}`
        : 'http://localhost:8081/api/persons';
    
    const method = currentPersonId ? 'PUT' : 'POST';
    
    console.log('Sending request to:', url);
    console.log('Method:', method);
    console.log('Headers:', {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
    });
    console.log('Body:', personData);

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(personData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Error saving person');
        }

        const data = await response.json();
        console.log('Response:', data);

        // Close modal and reset form
        const modal = document.getElementById('addPersonModal');
        modal.style.display = 'none';
        form.reset();
        currentPersonId = null;
        
        // If we're editing a person, reload their tree
        if (data.id) {
            await loadPersonTree(data.id);
        } else {
            // If we're adding a new person, reload the tree from their parent's perspective
            if (personData.fatherId) {
                await loadPersonTree(personData.fatherId);
            } else if (personData.motherId) {
                await loadPersonTree(personData.motherId);
            } else {
                // If no parents, reload the tree from the new person's perspective
                await loadPersonTree(data.id);
            }
        }
    } catch (error) {
        console.error('Error saving person:', error);
        alert(error.message);
    }
}

// Add refreshTreeView function
async function refreshTreeView() {
    try {
        // If we have a current person ID, reload their tree
        if (currentPersonId) {
            await loadPersonTree(currentPersonId);
        } else {
            // Otherwise, try to find a root person (someone without parents)
            const response = await fetch('http://localhost:8081/api/persons', {
                headers: getHeaders()
            });
            
            if (!response.ok) {
                throw new Error('Failed to fetch persons');
            }
            
            const persons = await response.json();
            if (persons && persons.length > 0) {
                // Find a person without parents
                const rootPerson = persons.find(p => !p.fatherId && !p.motherId);
                if (rootPerson) {
                    await loadPersonTree(rootPerson.id);
                } else {
                    // If no root person found, load the first person's tree
                    await loadPersonTree(persons[0].id);
                }
            }
        }
    } catch (error) {
        console.error('Error refreshing tree view:', error);
        showError('Error refreshing tree view. Please try again.');
    }
}

// Update the updatePersonInTree function to handle the new response format
function updatePersonInTree(personData) {
    const personNode = document.querySelector(`[data-id="${personData.id}"]`);
    if (personNode) {
        // Update the person's details in the tree
        const nameElement = personNode.querySelector('.person-name');
        if (nameElement) {
            nameElement.textContent = `${personData.firstName} ${personData.lastName}`;
        }
        
        // Update other visible details if needed
        const detailsElement = personNode.querySelector('.person-details');
        if (detailsElement) {
            detailsElement.innerHTML = `
                <div>${personData.gotra || ''}</div>
                <div>${personData.dateOfBirth ? new Date(personData.dateOfBirth).toLocaleDateString() : ''}</div>
            `;
        }
    }
}

// Update the addPersonToTree function to handle the new response format
function addPersonToTree(personData) {
    // Create a new person node
    const personNode = document.createElement('div');
    personNode.className = 'person';
    personNode.setAttribute('data-id', personData.id);
    
    personNode.innerHTML = `
        <div class="person-content">
            <div class="person-name">${personData.firstName} ${personData.lastName}</div>
            <div class="person-details">
                <div>${personData.gotra || ''}</div>
                <div>${personData.dateOfBirth ? new Date(personData.dateOfBirth).toLocaleDateString() : ''}</div>
            </div>
            <div class="person-actions">
                <button onclick="editPerson(${personData.id})">Edit</button>
                <button onclick="deletePerson(${personData.id})">Delete</button>
            </div>
        </div>
    `;
    
    // Add the person to the appropriate parent node
    if (personData.fatherId) {
        const fatherNode = document.querySelector(`[data-id="${personData.fatherId}"]`);
        if (fatherNode) {
            const childrenContainer = fatherNode.querySelector('.children') || createChildrenContainer(fatherNode);
            childrenContainer.appendChild(personNode);
        }
    } else if (personData.motherId) {
        const motherNode = document.querySelector(`[data-id="${personData.motherId}"]`);
        if (motherNode) {
            const childrenContainer = motherNode.querySelector('.children') || createChildrenContainer(motherNode);
            childrenContainer.appendChild(personNode);
        }
    } else {
        // If no parents, add to root level
        const treeContainer = document.getElementById('treeContainer');
        treeContainer.appendChild(personNode);
    }
}

// Update the editPerson function to handle the new response format
async function editPerson(id) {
    try {
        const response = await fetch(`http://localhost:8081/api/persons/${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Error fetching person details');
        }
        
        const personData = await response.json();
        
        // Populate the form with person data
        const form = document.getElementById('addPersonForm');
        form.firstName.value = personData.firstName;
        form.lastName.value = personData.lastName;
        form.dateOfBirth.value = personData.dateOfBirth;
        form.dateOfDeath.value = personData.dateOfDeath || '';
        form.gender.value = personData.gender;
        form.email.value = personData.email || '';
        form.phoneNumber.value = personData.phoneNumber || '';
        form.address.value = personData.address || '';
        form.gotra.value = personData.gotra;
        
        // Set parent IDs
        if (personData.fatherId) {
            form.fatherId.value = personData.fatherId;
            form.fatherSearch.value = personData.fatherName;
        }
        if (personData.motherId) {
            form.motherId.value = personData.motherId;
            form.motherSearch.value = personData.motherName;
        }
        
        // Set current person ID for update
        currentPersonId = id;
        
        // Show the modal
        const modal = document.getElementById('addPersonModal');
        modal.style.display = 'block';
    } catch (error) {
        console.error('Error:', error);
        alert('Error fetching person details');
    }
}

async function handleMainSearchInput(event) {
    const searchTerm = event.target.value.trim();
    const suggestionsDiv = document.getElementById('searchSuggestions');
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    if (!searchTerm) {
        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'none';
        }
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        try {
            const response = await fetch(`http://localhost:8081/api/persons/search?query=${encodeURIComponent(searchTerm)}`, {
                headers: {
                    ...getHeaders(),
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new TypeError("Response was not JSON");
            }
            
            const persons = await response.json();
            if (!Array.isArray(persons)) {
                throw new Error('Invalid response format');
            }
            
            if (suggestionsDiv) {
                if (persons.length > 0) {
                    suggestionsDiv.innerHTML = persons.map(person => {
                        if (!person || !person.id || !person.firstName || !person.lastName) {
                            return '';
                        }
                        
                        const fullName = `${person.firstName} ${person.lastName}`;
                        const fatherName = person.fatherName ? person.fatherName : 'Not specified';
                        const gotra = person.gotra || '';
                        
                        return `
                            <div class="suggestion-item" onclick="selectPerson(${person.id}, '${fullName.replace(/'/g, "\'")}')">
                                <div class="name">${fullName}</div>
                                <div class="details">
                                    Father: ${fatherName}
                                    ${gotra ? ` | Gotra: ${gotra}` : ''}
                                </div>
                            </div>
                        `;
                    }).join('');
                } else {
                    suggestionsDiv.innerHTML = '<div class="suggestion-item">No results found</div>';
                }
                suggestionsDiv.style.display = 'block';
            }
        } catch (error) {
            console.error('Error fetching suggestions:', error);
            if (suggestionsDiv) {
                if (error.name === 'AbortError') {
                    suggestionsDiv.innerHTML = '<div class="suggestion-item error">Request timed out</div>';
                } else {
                    suggestionsDiv.innerHTML = '<div class="suggestion-item error">Error loading suggestions</div>';
                }
                suggestionsDiv.style.display = 'block';
            }
        }
    }, 300);
}

function searchPerson() {
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) {
        console.error('Search input not found');
        return;
    }

    const searchTerm = searchInput.value.trim();
    if (!searchTerm) {
        showError('Please enter a name to search');
        return;
    }

    // Hide suggestions if they're visible
    const suggestionsDiv = document.getElementById('searchSuggestions');
    if (suggestionsDiv) {
        suggestionsDiv.style.display = 'none';
    }

    // Search for the person
    fetch(`http://localhost:8081/api/persons/search?query=${encodeURIComponent(searchTerm)}`, {
        headers: getHeaders() // Ensure headers are sent for searchPerson as well
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(persons => {
            if (!Array.isArray(persons) || persons.length === 0) {
                showError('No person found with that name');
                return;
            }

            // If only one person is found, load their tree directly
            if (persons.length === 1) {
                loadPersonTree(persons[0].id);
                return;
            }

            // If multiple persons are found, show suggestions
            if (suggestionsDiv) {
                suggestionsDiv.innerHTML = persons.map(person => {
                    if (!person || !person.id || !person.firstName || !person.lastName) {
                        return '';
                    }
                    
                    const fullName = `${person.firstName} ${person.lastName}`;
                    const fatherName = person.fatherName ? person.fatherName : 'Not specified'; // Use fatherName from DTO
                    const gotra = person.gotra || '';
                    
                    return `
                            <div class="suggestion-item" onclick="selectPerson(${person.id}, '${fullName.replace(/'/g, "\'")}')">
                                <div class="name">${fullName}</div>
                                <div class="details">
                                    Father: ${fatherName}
                                    ${gotra ? ` | Gotra: ${gotra}` : ''}
                                </div>
                            </div>
                        `;
                }).join('');
                suggestionsDiv.style.display = 'block';
            }
        })
        .catch(error => {
            console.error('Error searching for person:', error);
            showError('Error searching for person. Please try again.'); // Show error to user
            if (suggestionsDiv) {
                suggestionsDiv.style.display = 'none';
            }
        });
}

function selectPerson(personId, personName) {
    try {
        const searchInput = document.getElementById('searchInput');
        const suggestionsDiv = document.getElementById('searchSuggestions');
        
        if (searchInput) {
            searchInput.value = personName;
        }
        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'none';
        }
        
        loadPersonTree(personId);
    } catch (error) {
        console.error('Error selecting person:', error);
        showError('Error selecting person. Please try again.');
    }
}

async function loadPersonTree(personId) {
    try {
        if (!personId) {
            throw new Error('Person ID is required');
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

        const fetchWithTimeout = async (url) => {
            const response = await fetch(url, {
                headers: {
                    ...getHeaders(),
                    'Accept': 'application/json'
                },
                signal: controller.signal
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                throw new TypeError("Response was not JSON");
            }

            return response.json();
        };

        try {
            // Load person data
            const person = await fetchWithTimeout(`http://localhost:8081/api/persons/${personId}`);
            if (!person || !person.id) {
                throw new Error('Invalid person data received');
            }

            // Load parents data
            const parents = await fetchWithTimeout(`http://localhost:8081/api/persons/${personId}/parents`);

            // Load spouses data
            const spouses = await fetchWithTimeout(`http://localhost:8081/api/persons/${personId}/spouses`);

            // Load children data
            const children = await fetchWithTimeout(`http://localhost:8081/api/persons/${personId}/children`);

            clearTimeout(timeoutId);

            // Build and update tree
            updateTree(person, parents, spouses, children);
            showPersonDetails(person);
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    } catch (error) {
        console.error('Error loading person data:', error);
        if (error.name === 'AbortError') {
            showError('Request timed out. Please try again.');
        } else {
            showError('Error loading person data. Please try again.');
        }
    }
}

function buildTreeData(person, parents, spouses, children) {
    if (!person || !person.id || !person.firstName || !person.lastName) {
        throw new Error('Invalid person data');
    }

    // Create the main person node
    const root = {
        id: person.id,
        name: `${person.firstName} ${person.lastName}`,
        type: 'root_person',
        level: 2, // Middle level
        children: []
    };

    // Add Parents group (Level 1 - Top)
    if (Array.isArray(parents) && parents.length > 0) {
        const parentsGroup = {
            name: 'Parents',
            isCategory: true,
            categoryType: 'parents',
            level: 1, // Top level
            children: parents.map(p => {
                if (!p || !p.id || !p.firstName || !p.lastName) { return null; }
                return { 
                    id: p.id, 
                    name: `${p.firstName} ${p.lastName}`, 
                    type: 'person_node', 
                    level: 1,
                    originalData: p 
                };
            }).filter(Boolean)
        };
        root.children.push(parentsGroup);
    }

    // Add Spouses group (Level 2 - Same level as root)
    if (Array.isArray(spouses) && spouses.length > 0) {
        const spousesGroup = {
            name: 'Spouses',
            isCategory: true,
            categoryType: 'spouses',
            level: 2, // Same level as root
            children: spouses.map(s => {
                if (!s || !s.id || !s.firstName || !s.lastName) { return null; }
                return { 
                    id: s.id, 
                    name: `${s.firstName} ${s.lastName}`, 
                    type: 'person_node', 
                    level: 2,
                    originalData: s 
                };
            }).filter(Boolean)
        };
        root.children.push(spousesGroup);
    }

    // Add Children group (Level 3 - Bottom)
    if (Array.isArray(children) && children.length > 0) {
        const childrenGroup = {
            name: 'Children',
            isCategory: true,
            categoryType: 'children',
            level: 3, // Bottom level
            children: children.map(c => {
                if (!c || !c.id || !c.firstName || !c.lastName) { return null; }
                return { 
                    id: c.id, 
                    name: `${c.firstName} ${c.lastName}`, 
                    type: 'person_node', 
                    level: 3,
                    originalData: c 
                };
            }).filter(Boolean)
        };
        root.children.push(childrenGroup);
    }

    return root;
}

function getMaxNameLength(treeData) {
    let maxLength = 0;
    function traverse(node) {
        if (node && node.name) {
            maxLength = Math.max(maxLength, node.name.length);
        }
        if (node.children && node.children.length > 0) {
            node.children.forEach(traverse);
        }
    }
    traverse(treeData);
    return maxLength;
}

function updateTree(personData, parentsData, spousesData, childrenData) {
    if (!mainSvg || !chartGroup) {
        initTree();
    }

    // Clear existing content
    chartGroup.selectAll("*").remove();

    // Build the tree data
    const treeData = buildTreeData(personData, parentsData, spousesData, childrenData);
    
    // Create the tree layout with vertical orientation
    const treeLayout = d3.tree()
        .size([height - margin.top - margin.bottom, width - margin.left - margin.right])
        .nodeSize([100, 250]) // Increased spacing for better level separation
        .separation((a, b) => {
            // Adjust separation based on levels
            if (a.data.level === b.data.level) {
                return 1.5; // More space between nodes at same level
            }
            return 1;
        });

    // Compute the tree layout
    const root = d3.hierarchy(treeData);
    const treeNodes = treeLayout(root);

    // Draw the links with horizontal orientation
    chartGroup.selectAll(".link")
        .data(treeNodes.links())
        .enter()
        .append("path")
        .attr("class", "link")
        .attr("d", d3.linkHorizontal()
            .x(d => d.y)
            .y(d => d.x));

    // Draw the nodes
    const node = chartGroup.selectAll(".node")
        .data(treeNodes.descendants())
        .enter()
        .append("g")
        .attr("class", d => `node level-${d.data.level}`)
        .attr("transform", d => `translate(${d.y},${d.x})`)
        .style("cursor", d => d.data.type === 'person_node' ? 'pointer' : 'default')
        .on("click", (event, d) => {
            if (d.data.type === 'person_node' && d.data.id) {
                loadPersonTree(d.data.id);
            }
        });

    // Add circles to nodes with different colors based on level
    node.append("circle")
        .attr("r", 10)
        .style("fill", "#fff")
        .style("stroke", d => {
            switch(d.data.level) {
                case 1: return "#4CAF50"; // Parents - Green
                case 2: return "#2196F3"; // Main person and spouses - Blue
                case 3: return "#FF9800"; // Children - Orange
                default: return "#4CAF50";
            }
        })
        .style("stroke-width", "2px");

    // Add text labels with adjusted positioning for vertical layout
    node.append("text")
        .attr("dy", ".35em")
        .attr("x", d => d.children ? -13 : 13)
        .style("text-anchor", d => d.children ? "end" : "start")
        .text(d => d.data.name)
        .call(wrap, 120);

    // Center the tree
    const bounds = chartGroup.node().getBBox();
    const parent = d3.select("#tree-container");
    const fullWidth = parent.node().getBoundingClientRect().width;
    const fullHeight = parent.node().getBoundingClientRect().height;
    
    const scale = 0.8 / Math.max(bounds.width / fullWidth, bounds.height / fullHeight);
    const transform = d3.zoomIdentity
        .translate(fullWidth / 2, fullHeight / 2)
        .scale(scale)
        .translate(-bounds.x - bounds.width / 2, -bounds.y - bounds.height / 2);
    
    mainSvg.call(d3Zoom.transform, transform);
}

// Add text wrapping function
function wrap(text, width) {
    text.each(function() {
        const text = d3.select(this);
        const words = text.text().split(/\s+/).reverse();
        let word;
        let line = [];
        let lineNumber = 0;
        const lineHeight = 1.1; // ems
        const y = text.attr("y");
        const dy = parseFloat(text.attr("dy"));
        let tspan = text.text(null).append("tspan")
            .attr("x", text.attr("x"))
            .attr("y", y)
            .attr("dy", dy + "em");

        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan")
                    .attr("x", text.attr("x"))
                    .attr("y", y)
                    .attr("dy", ++lineNumber * lineHeight + dy + "em")
                    .text(word);
            }
        }
    });
}

function showPersonDetails(person) {
    try {
        if (!person || !person.id || !person.firstName || !person.lastName) {
            throw new Error('Invalid person data');
        }

        const detailsDiv = document.getElementById('person-details');
        if (!detailsDiv) {
            throw new Error('Details div not found');
        }

        const fullName = `${person.firstName} ${person.lastName}`;
        // Update to use fatherName and motherName directly from PersonResponse DTO
        const fatherName = person.fatherName ? person.fatherName : 'Not specified';
        const motherName = person.motherName ? person.motherName : 'Not specified';
        const gotra = person.gotra || '';
        
        // Create a safe copy of the person object for the onclick handler
        // Ensure fatherId, fatherName, motherId, motherName are passed directly
        const safePerson = {
            id: person.id,
            firstName: person.firstName,
            lastName: person.lastName,
            dateOfBirth: person.dateOfBirth,
            dateOfDeath: person.dateOfDeath,
            gender: person.gender,
            email: person.email,
            phoneNumber: person.phoneNumber,
            address: person.address,
            gotra: person.gotra,
            fatherId: person.fatherId || null,
            fatherName: person.fatherName || null,
            motherId: person.motherId || null,
            motherName: person.motherName || null
        };
        
        detailsDiv.innerHTML = `
            <div class="person-card">
                <div class="person-header">
                    <h3>${fullName}</h3>
                    <div class="button-group">
                        <button class="edit-button" onclick='openEditPersonModal(${JSON.stringify(safePerson)})'>Edit</button>
                        <button class="add-spouse-button" onclick='openAddSpouseModal(${person.id})'>Add Spouse</button>
                    </div>
                </div>
                <p><strong>Date of Birth:</strong> ${new Date(person.dateOfBirth).toLocaleDateString()}</p>
                ${person.dateOfDeath ? `<p><strong>Date of Death:</strong> ${new Date(person.dateOfDeath).toLocaleDateString()}</p>` : ''}
                <p><strong>Gender:</strong> ${person.gender}</p>
                ${person.email ? `<p><strong>Email:</strong> ${person.email}</p>` : ''}
                ${person.phoneNumber ? `<p><strong>Phone:</strong> ${person.phoneNumber}</p>` : ''}
                ${person.address ? `<p><strong>Address:</strong> ${person.address}</p>` : ''}
                <p><strong>Father:</strong> ${fatherName}</p>
                <p><strong>Mother:</strong> ${motherName}</p>
                ${gotra ? `<p><strong>Gotra:</strong> ${gotra}</p>` : ''}
            </div>
        `;
        detailsDiv.classList.remove('hidden');
    } catch (error) {
        console.error('Error showing person details:', error);
        showError('Error displaying person details. Please try again.');
    }
}

function openAddSpouseModal(personId) {
    try {
        const modal = document.getElementById('addSpouseModal');
        if (!modal) {
            throw new Error('Modal element not found');
        }
        
        modal.style.display = 'block';
        const form = document.getElementById('addSpouseForm');
        if (form) {
            form.reset();
            form.person1Id.value = personId;
            // Clear spouse search input and hidden ID
            document.getElementById('spouseSearch').value = '';
            document.getElementById('person2Id').value = '';
            document.getElementById('spouseSuggestions').style.display = 'none';
        }
        
        // loadSpouseOptions(personId); // No longer needed with searchable spouse
    } catch (error) {
        console.error('Error opening spouse modal:', error);
        showError('Error opening spouse form. Please try again.');
    }
}

async function loadSpouseOptions(personId) {
    // This function is no longer needed in its original form as we are now using search inputs.
    console.log('loadSpouseOptions is deprecated for search fields. Use handleSpouseSearchInput instead.');
}

async function handleSpouseSearchInput(event) {
    const searchTerm = event.target.value.trim();
    const suggestionsDiv = document.getElementById('spouseSuggestions');
    
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    
    if (!searchTerm) {
        if (suggestionsDiv) {
            suggestionsDiv.style.display = 'none';
        }
        // Clear the hidden ID when the search term is empty
        const hiddenIdInput = document.getElementById('person2Id');
        if (hiddenIdInput) {
            hiddenIdInput.value = '';
        }
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        const response = await fetch(`http://localhost:8081/api/persons/search?query=${encodeURIComponent(searchTerm)}`, {
            headers: getHeaders()
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const persons = await response.json();
        if (!Array.isArray(persons)) {
            throw new Error('Invalid response format');
        }
        
        if (suggestionsDiv) {
            if (persons.length > 0) {
                suggestionsDiv.innerHTML = persons.map(person => {
                    if (!person || !person.id || !person.firstName || !person.lastName) {
                        return '';
                    }
                    
                    const fullName = `${person.firstName} ${person.lastName}`;
                    const fatherName = person.father ? `${person.father.firstName} ${person.father.lastName}` : 'Not specified';
                    const gotra = person.gotra || '';
                    
                    return `
                        <div class="suggestion-item" onclick="selectSpouse(${person.id}, '${fullName.replace(/'/g, "\\'")}')">
                            <div class="name">${fullName}</div>
                            <div class="details">
                                Father: ${fatherName}
                                ${gotra ? ` | Gotra: ${gotra}` : ''}
                            </div>
                        </div>
                    `;
                }).join('');
                suggestionsDiv.style.display = 'block';
            } else {
                suggestionsDiv.innerHTML = '';
                suggestionsDiv.style.display = 'none';
            }
        }
    }, 300);
}

function selectSpouse(personId, personName) {
    const searchInput = document.getElementById('spouseSearch');
    const hiddenIdInput = document.getElementById('person2Id');
    const suggestionsDiv = document.getElementById('spouseSuggestions');
    
    if (searchInput) {
        searchInput.value = personName;
    }
    if (hiddenIdInput) {
        hiddenIdInput.value = personId;
    }
    if (suggestionsDiv) {
        suggestionsDiv.style.display = 'none';
    }
}

async function handleAddSpouse(event) {
    if (!currentUser || !currentUser.roles.includes('ADMIN')) {
        showError('Only administrators can add spouses');
        return;
    }
    event.preventDefault();
    
    const form = event.target;
    const person1Id = form.person1Id.value;
    const person2Id = document.getElementById('person2Id').value; // Get from hidden input
    const marriageDate = form.marriageDate.value;
    
    if (!person1Id || !person2Id || !marriageDate) {
        showError('All fields are required');
        return;
    }
    
    try {
        // Format the date to YYYY-MM-DD
        const formattedDate = new Date(marriageDate).toISOString().split('T')[0];
        
        // Create the request body
        const requestBody = {
            person1Id: parseInt(person1Id),
            person2Id: parseInt(person2Id),
            marriageDate: formattedDate
        };

        // Make the API call with retry logic
        let response;
        let retryCount = 0;
        const maxRetries = 3;

        while (retryCount < maxRetries) {
            try {
                response = await fetch('http://localhost:8081/api/persons/marriage', {
                    method: 'POST',
                    headers: getHeaders(),
                    body: JSON.stringify(requestBody)
                });
                break; // If successful, break the retry loop
            } catch (error) {
                retryCount++;
                if (retryCount === maxRetries) {
                    throw error;
                }
                // Wait for a short time before retrying
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        if (!response) {
            throw new Error('Failed to get response from server');
        }

        let responseData;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            responseData = await response.json();
        } else {
            const text = await response.text();
            try {
                responseData = JSON.parse(text);
            } catch (e) {
                responseData = { message: text };
            }
        }

        if (!response.ok) {
            if (response.status === 400) {
                showError(responseData.message || 'Invalid input data');
            } else if (response.status === 500) {
                console.error('Server error:', responseData);
                showError('Server error occurred. Please try again later.');
            } else {
                showError(responseData.message || `Error: ${response.status}`);
            }
            return;
        }

        if (!responseData || !responseData.id) {
            throw new Error('Invalid marriage data received from server');
        }

        closeAddSpouseModal();
        await loadPersonTree(person1Id);
        showError('Spouse added successfully!');
    } catch (error) {
        console.error('Error:', error);
        showError(`Error adding spouse: ${error.message}`);
    }
}

function closeAddSpouseModal() {
    try {
        const modal = document.getElementById('addSpouseModal');
        if (!modal) {
            throw new Error('Modal element not found');
        }
        
        modal.style.display = 'none';
        const form = document.getElementById('addSpouseForm');
        if (form) {
            form.reset();
        }
    } catch (error) {
        console.error('Error closing spouse modal:', error);
        showError('Error closing spouse form. Please try again.');
    }
}

// Authentication functions
function openLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'block';
}

function closeLoginModal() {
    const modal = document.getElementById('loginModal');
    modal.style.display = 'none';
    document.getElementById('loginForm').reset();
}

function openRegisterModal() {
    const modal = document.getElementById('registerModal');
    modal.style.display = 'block';
}

function closeRegisterModal() {
    const modal = document.getElementById('registerModal');
    modal.style.display = 'none';
    document.getElementById('registerForm').reset();
}

async function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;
    
    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Login failed');
        }

        // Store the token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            username: data.username,
            roles: data.roles
        }));

        currentUser = {
            username: data.username,
            roles: data.roles
        };

        updateUIForUser();
        closeLoginModal();
        showError('Login successful!');
    } catch (error) {
        console.error('Login error:', error);
        showError(error.message);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showError('Passwords do not match');
        return;
    }
    
    try {
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || 'Registration failed');
        }

        // Store the token and user info
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
            username: data.username,
            roles: data.roles
        }));

        currentUser = {
            username: data.username,
            roles: data.roles
        };

        updateUIForUser();
        closeRegisterModal();
        showError('Registration successful!');
    } catch (error) {
        console.error('Registration error:', error);
        showError(error.message);
    }
}

function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    updateUIForUser();
    showError('Logged out successfully');
    window.location.href = '/login.html'; // Redirect to login page
}

function updateUIForUser() {
    const loginButton = document.getElementById('loginButton');
    const registerButton = document.getElementById('registerButton');
    const logoutButton = document.getElementById('logoutButton');
    const addPersonBtn = document.getElementById('addPersonBtn');
    
    if (currentUser) {
        if (loginButton) loginButton.style.display = 'none';
        if (registerButton) registerButton.style.display = 'none';
        if (logoutButton) logoutButton.style.display = 'inline-block';
        
        // Check if user is admin
        const isAdmin = currentUser.roles.includes('ADMIN');
        document.body.classList.toggle('admin', isAdmin);

        // Show/hide Add Person button based on admin role
        if (addPersonBtn) {
            addPersonBtn.style.display = isAdmin ? 'inline-block' : 'none';
        }
    } else {
        if (loginButton) loginButton.style.display = 'inline-block';
        if (registerButton) registerButton.style.display = 'inline-block';
        if (logoutButton) logoutButton.style.display = 'none';
        document.body.classList.remove('admin');
        if (addPersonBtn) {
            addPersonBtn.style.display = 'none';
        }
    }
}

// Helper function to get headers with JWT token
function getHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : ''
    };
}

// Update fetch calls to use getHeaders()
async function fetchPersons() {
    try {
        const response = await fetch('http://localhost:8081/api/persons', {
            headers: getHeaders()
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Failed to fetch persons');
        }
        
        const persons = await response.json();
        renderTree(persons);
    } catch (error) {
        console.error('Error fetching persons:', error);
    }
}

// Update other fetch calls similarly
async function createPerson(personData) {
    try {
        const response = await fetch('http://localhost:8081/api/persons', {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(personData)
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                window.location.href = '/login.html';
                return;
            }
            throw new Error('Failed to create person');
        }
        
        await fetchPersons();
    } catch (error) {
        console.error('Error creating person:', error);
    }
}

// Initialize user state on page load
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Load user state from localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
        }
        updateUIForUser();
        
        initTree();
        // Add zoom button listeners
        const zoomInBtn = document.getElementById('zoom-in');
        const zoomOutBtn = document.getElementById('zoom-out');
        if (zoomInBtn) {
            zoomInBtn.addEventListener('click', () => setZoom(0.2));
        }
        if (zoomOutBtn) {
            zoomOutBtn.addEventListener('click', () => setZoom(-0.2));
        }

        // Check authentication on page load
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login.html';
            return;
        }
    } catch (error) {
        console.error('Error initializing application:', error);
        showError('Error initializing application. Please refresh the page.');
    }
});

// Add window resize handler
window.addEventListener('resize', () => {
    // Re-initialize and update tree on resize to ensure correct sizing and centering
    if (treeData && mainSvg) { // Check if treeData exists and mainSvg is initialized
        // Re-create SVG and chartGroup with new container dimensions
        d3.select("#tree-container svg").remove(); // Remove old SVG
        initTree();
        // Re-load current person to re-build and re-render tree correctly
        if (currentPersonId) {
            loadPersonTree(currentPersonId);
        }
    }
});

// Add logout functionality
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    currentUser = null;
    updateUIForUser();
    showError('Logged out successfully');
    window.location.href = '/login.html'; // Redirect to login page
}

// Add event listener for logout button
document.addEventListener('DOMContentLoaded', () => {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}); 