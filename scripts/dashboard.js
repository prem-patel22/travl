document.addEventListener('DOMContentLoaded', function() {
    // Check authentication - redirect if not logged in
    if (!AuthManager.isAuthenticated()) {
        window.location.href = 'auth.html?action=login';
        return;
    }

    // Initialize
    initializeTheme();
    loadUserData();
    initializeMap();
    loadSampleData();
    setupEventListeners();

    // Dashboard functionality
    function loadUserData() {
        const user = AuthManager.getCurrentUser();
        if (user) {
            document.getElementById('userName').textContent = user.name;
            document.getElementById('userEmail').textContent = user.email;
            document.getElementById('userAvatar').textContent = user.name.charAt(0).toUpperCase();
        } else {
            // If no user data found, redirect to login
            AuthManager.logout();
        }
    }

    function initializeMap() {
        // Mapbox initialization would go here
        console.log('Map initialized - Add your Mapbox token in production');
        
        // Create a simple placeholder map style
        const mapElement = document.getElementById('map');
        if (mapElement) {
            mapElement.style.background = 'linear-gradient(135deg, #e2e8f0, #cbd5e1)';
            mapElement.style.display = 'flex';
            mapElement.style.alignItems = 'center';
            mapElement.style.justifyContent = 'center';
            mapElement.style.color = '#64748b';
            mapElement.style.fontSize = '1rem';
            mapElement.innerHTML = '🗺️ Map View - Add Mapbox Token for Interactive Map';
        }
    }

    function loadSampleData() {
        let currentTrip = StorageManager.getItem('current_trip');
        
        if (!currentTrip) {
            // Create sample trip if none exists
            currentTrip = {
                id: 'sample_trip_1',
                name: "Rome Adventure",
                location: "Rome, Italy",
                startDate: "2024-12-10",
                endDate: "2024-12-12",
                budget: 850,
                totalSpent: 65,
                activities: [
                    {
                        id: 1,
                        name: "Colosseum Guided Tour",
                        date: "2024-12-10",
                        time: "09:00",
                        duration: 2,
                        cost: 25,
                        category: "sightseeing",
                        address: "Piazza del Colosseo, 1, 00184 Roma RM, Italy",
                        notes: "Ancient Roman amphitheater guided tour",
                        booked: false
                    },
                    {
                        id: 2,
                        name: "Lunch in Trastevere",
                        date: "2024-12-10",
                        time: "12:00",
                        duration: 1.5,
                        cost: 40,
                        category: "food",
                        address: "Trastevere, Rome, Italy",
                        notes: "Authentic Italian cuisine in charming district",
                        booked: false
                    }
                ]
            };
            StorageManager.setItem('current_trip', currentTrip);
        }
        
        renderItinerary(currentTrip);
        updateTripSummary(currentTrip);
        loadAISuggestions();
    }

    function renderItinerary(trip) {
        const timeline = document.getElementById('itineraryTimeline');
        
        if (!trip.activities || trip.activities.length === 0) {
            timeline.innerHTML = `
                <div class="empty-state">
                    <p>No activities planned yet.</p>
                    <button class="add-activity-btn" id="addFirstActivity">+ Add Your First Activity</button>
                </div>
            `;
            
            document.getElementById('addFirstActivity').addEventListener('click', function() {
                document.getElementById('addDestinationModal').classList.add('active');
            });
            return;
        }

        // Group activities by date
        const activitiesByDate = {};
        trip.activities.forEach(activity => {
            if (!activitiesByDate[activity.date]) {
                activitiesByDate[activity.date] = [];
            }
            activitiesByDate[activity.date].push(activity);
        });

        let html = '';
        let dayNumber = 1;
        
        Object.keys(activitiesByDate).sort().forEach((date) => {
            const activities = activitiesByDate[date];
            const formattedDate = new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'short',
                day: 'numeric'
            });

            html += `
                <div class="day-section">
                    <div class="day-header">
                        <h3>Day ${dayNumber}</h3>
                        <span class="day-date">${formattedDate}</span>
                    </div>
                    <div class="itinerary-list">
            `;

            activities.sort((a, b) => a.time.localeCompare(b.time)).forEach(activity => {
                const categoryClass = activity.category || 'general';
                html += `
                    <div class="itinerary-item" draggable="true" data-activity-id="${activity.id}">
                        <div class="item-marker">
                            <div class="time-dot"></div>
                            <div class="time-line"></div>
                        </div>
                        <div class="item-content">
                            <div class="item-time">${formatTime(activity.time)}</div>
                            <div class="item-details">
                                <h4>${activity.name}</h4>
                                <p>${activity.notes || 'No description'}</p>
                                <div class="item-meta">
                                    <span class="duration">${activity.duration}h</span>
                                    <span class="price">${CurrencyFormatter.formatUSD(activity.cost)}</span>
                                    <div class="item-tags">
                                        <span class="tag ${categoryClass}">${categoryClass}</span>
                                        ${activity.booked ? '<span class="tag booked">Booked</span>' : ''}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="btn-action btn-edit" title="Edit" data-activity-id="${activity.id}">✏️</button>
                            <button class="btn-action btn-delete" title="Delete" data-activity-id="${activity.id}">🗑️</button>
                        </div>
                    </div>
                `;
            });

            html += `
                    </div>
                </div>
            `;
            dayNumber++;
        });

        timeline.innerHTML = html;
        setupItineraryInteractions();
    }

    function formatTime(timeString) {
        // Convert 24h time to 12h format
        const [hours, minutes] = timeString.split(':');
        const hour = parseInt(hours);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const formattedHour = hour % 12 || 12;
        return `${formattedHour}:${minutes} ${ampm}`;
    }

    function updateTripSummary(trip) {
        document.getElementById('currentTripName').textContent = trip.name;
        document.getElementById('totalStops').textContent = trip.activities ? trip.activities.length : 0;
        
        const totalCost = trip.activities ? trip.activities.reduce((sum, activity) => sum + (activity.cost || 0), 0) : 0;
        document.getElementById('totalBudget').textContent = CurrencyFormatter.formatUSD(totalCost);
        
        // Calculate approximate distance (this would come from map API in real app)
        const approximateDistance = trip.activities ? (trip.activities.length * 2.4) + 'km' : '0km';
        document.getElementById('totalDistance').textContent = approximateDistance;
        
        document.getElementById('tripLocation').textContent = trip.location;
        
        if (trip.startDate && trip.endDate) {
            document.getElementById('tripDate').textContent = 
                `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`;
        } else {
            document.getElementById('tripDate').textContent = 'Dates not set';
        }
    }

    function loadAISuggestions() {
        const suggestionsList = document.getElementById('suggestionsList');
        const sampleSuggestions = [
            {
                name: "Vatican Museums & Sistine Chapel",
                description: "Skip-the-line tickets available. Famous for Michelangelo's masterpiece.",
                cost: 32,
                type: "Museum",
                rating: 4.8
            },
            {
                name: "Evening Walk at Piazza Navona",
                description: "Beautiful Baroque square with fountains and street performers.",
                cost: 0,
                type: "Walking",
                rating: 4.6
            },
            {
                name: "Pasta Making Class",
                description: "Learn to make authentic Italian pasta with local chef.",
                cost: 65,
                type: "Cooking",
                rating: 4.9
            },
            {
                name: "Trevi Fountain Visit",
                description: "Iconic Baroque fountain. Don't forget to throw a coin!",
                cost: 0,
                type: "Sightseeing",
                rating: 4.7
            }
        ];

        let html = '';
        sampleSuggestions.forEach((suggestion, index) => {
            html += `
                <div class="suggestion-item">
                    <div class="suggestion-content">
                        <h4>${suggestion.name}</h4>
                        <p>${suggestion.description}</p>
                        <div class="suggestion-meta">
                            <span class="rating">⭐ ${suggestion.rating}</span>
                            <span class="type">${suggestion.type}</span>
                            <span class="cost">${suggestion.cost > 0 ? CurrencyFormatter.formatUSD(suggestion.cost) : 'Free'}</span>
                        </div>
                    </div>
                    <button class="btn-add" data-suggestion-index="${index}">+ Add</button>
                </div>
            `;
        });

        suggestionsList.innerHTML = html;

        // Add event listeners to suggestion buttons
        document.querySelectorAll('.btn-add').forEach(btn => {
            btn.addEventListener('click', function() {
                const index = this.getAttribute('data-suggestion-index');
                addSuggestionToItinerary(sampleSuggestions[index]);
            });
        });
    }

    function addSuggestionToItinerary(suggestion) {
        const currentTrip = StorageManager.getItem('current_trip');
        const newActivity = {
            id: Date.now(),
            name: suggestion.name,
            date: currentTrip.startDate || new Date().toISOString().split('T')[0],
            time: '14:00', // Default time
            duration: 2,
            cost: suggestion.cost,
            category: suggestion.type.toLowerCase(),
            notes: suggestion.description,
            booked: false
        };

        if (!currentTrip.activities) {
            currentTrip.activities = [];
        }

        currentTrip.activities.push(newActivity);
        StorageManager.setItem('current_trip', currentTrip);
        
        renderItinerary(currentTrip);
        updateTripSummary(currentTrip);
        
        showNotification(`Added "${suggestion.name}" to your itinerary!`);
    }

    function setupEventListeners() {
        // Theme toggle
        document.getElementById('themeToggle').addEventListener('click', toggleTheme);

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show appropriate content based on tab
                const tab = this.getAttribute('data-tab');
                showTabContent(tab);
            });
        });

        // User menu
        const userMenuBtn = document.getElementById('userMenuBtn');
        const userDropdown = document.getElementById('userDropdown');
        
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', function() {
            if (confirm('Are you sure you want to sign out?')) {
                AuthManager.logout();
            }
        });

        // Close dropdown when clicking outside
        document.addEventListener('click', function() {
            userDropdown.classList.remove('show');
        });

        // Refresh suggestions
        document.getElementById('refreshSuggestions').addEventListener('click', function() {
            loadAISuggestions();
            showNotification('Suggestions refreshed!');
        });

        // Export button
        document.getElementById('exportBtn').addEventListener('click', function() {
            showNotification('Export feature coming soon!');
        });

        // Modal functionality
        setupModals();
    }

    function showTabContent(tab) {
        // For now, just show notifications
        const messages = {
            plan: 'Welcome to your travel planner!',
            discover: 'Discover amazing places to visit!',
            trips: 'View and manage your trips!'
        };
        showNotification(messages[tab] || 'Feature coming soon!');
    }

    function setupModals() {
        const modals = document.querySelectorAll('.modal-overlay');
        
        // Open add destination modal
        document.getElementById('addDestination').addEventListener('click', function() {
            document.getElementById('addDestinationModal').classList.add('active');
        });

        // Open new trip modal
        document.getElementById('newTripBtn').addEventListener('click', function() {
            // Set default dates in new trip form
            const today = new Date().toISOString().split('T')[0];
            const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            
            document.getElementById('tripStartDate').value = today;
            document.getElementById('tripEndDate').value = nextWeek;
            
            document.getElementById('newTripModal').classList.add('active');
        });

        // Close modals
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                modals.forEach(modal => modal.classList.remove('active'));
            });
        });

        // Close modal when clicking overlay
        modals.forEach(modal => {
            modal.addEventListener('click', function(e) {
                if (e.target === this) {
                    this.classList.remove('active');
                }
            });
        });

        // Form submissions
        document.getElementById('destinationForm').addEventListener('submit', handleAddDestination);
        document.getElementById('newTripForm').addEventListener('submit', handleNewTrip);
    }

    function handleAddDestination(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('destinationName').value.trim(),
            address: document.getElementById('destinationAddress').value.trim(),
            date: document.getElementById('activityDate').value,
            time: document.getElementById('activityTime').value,
            duration: parseFloat(document.getElementById('activityDuration').value) || 1,
            cost: parseFloat(document.getElementById('activityCost').value) || 0,
            category: document.getElementById('activityCategory').value,
            notes: document.getElementById('activityNotes').value.trim()
        };

        // Validation
        if (!formData.name) {
            alert('Please enter a destination name');
            return;
        }

        // Add to current trip
        const currentTrip = StorageManager.getItem('current_trip');
        const newActivity = {
            id: Date.now(),
            ...formData
        };

        if (!currentTrip.activities) {
            currentTrip.activities = [];
        }

        currentTrip.activities.push(newActivity);
        StorageManager.setItem('current_trip', currentTrip);
        
        // Update UI
        renderItinerary(currentTrip);
        updateTripSummary(currentTrip);
        
        // Close modal and reset form
        document.getElementById('addDestinationModal').classList.remove('active');
        e.target.reset();
        
        showNotification('Activity added successfully!');
    }

    function handleNewTrip(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('tripName').value.trim(),
            startDate: document.getElementById('tripStartDate').value,
            endDate: document.getElementById('tripEndDate').value,
            destination: document.getElementById('tripDestination').value.trim(),
            budget: parseFloat(document.getElementById('tripBudget').value) || 0,
            description: document.getElementById('tripDescription').value.trim()
        };

        if (!formData.name || !formData.destination) {
            alert('Please fill in trip name and destination');
            return;
        }

        const newTrip = {
            id: 'trip_' + Date.now(),
            ...formData,
            location: formData.destination,
            activities: [],
            createdAt: new Date().toISOString()
        };

        StorageManager.setItem('current_trip', newTrip);
        
        // Update UI
        renderItinerary(newTrip);
        updateTripSummary(newTrip);
        
        // Close modal
        document.getElementById('newTripModal').classList.remove('active');
        e.target.reset();
        
        showNotification('New trip created successfully!');
    }

    function setupItineraryInteractions() {
        // Delete activity
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', function() {
                const activityId = parseInt(this.getAttribute('data-activity-id'));
                if (confirm('Are you sure you want to delete this activity?')) {
                    deleteActivity(activityId);
                }
            });
        });

        // Edit activity (placeholder for now)
        document.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', function() {
                const activityId = parseInt(this.getAttribute('data-activity-id'));
                showNotification('Edit feature coming soon! Activity ID: ' + activityId);
            });
        });
    }

    function deleteActivity(activityId) {
        const currentTrip = StorageManager.getItem('current_trip');
        if (currentTrip.activities) {
            currentTrip.activities = currentTrip.activities.filter(activity => activity.id !== activityId);
            StorageManager.setItem('current_trip', currentTrip);
            renderItinerary(currentTrip);
            updateTripSummary(currentTrip);
            showNotification('Activity deleted successfully!');
        }
    }

    function showNotification(message) {
        // Remove existing notification
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            z-index: 1000;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Add CSS for animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
        .user-dropdown {
            display: none;
            position: absolute;
            top: 100%;
            right: 0;
            background: var(--bg-primary);
            border: 1px solid var(--border);
            border-radius: 8px;
            box-shadow: var(--shadow-lg);
            min-width: 200px;
            z-index: 1000;
        }
        .user-dropdown.show {
            display: block;
        }
        .tag.booked {
            background: #dcfce7;
            color: #166534;
        }
    `;
    document.head.appendChild(style);
});