// Map Integration System
class SearchMap {
    constructor(containerId) {
        this.containerId = containerId;
        this.map = null;
        this.markers = [];
        this.clusterGroup = null;
        this.init();
    }

    init() {
        this.initializeMap();
        this.setupMapControls();
    }

    initializeMap() {
        // Initialize Leaflet map
        this.map = L.map(this.containerId).setView([20, 0], 2);

        // Add tile layer (using OpenStreetMap)
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap contributors',
            maxZoom: 18
        }).addTo(this.map);

        // Initialize marker cluster group
        this.clusterGroup = L.markerClusterGroup({
            chunkedLoading: true,
            maxClusterRadius: 50
        });
        this.map.addLayer(this.clusterGroup);
    }

    setupMapControls() {
        // Add zoom controls
        this.map.zoomControl.setPosition('topright');

        // Add custom controls
        this.addCustomControls();
    }

    addCustomControls() {
        // Location finder button
        const locateButton = L.control({ position: 'topright' });
        locateButton.onAdd = () => {
            const div = L.DomUtil.create('div', 'map-controls');
            div.innerHTML = `
                <button class="map-btn" id="locate-me" title="Find my location">
                    <i class="fas fa-location-arrow"></i>
                </button>
                <button class="map-btn" id="reset-view" title="Reset view">
                    <i class="fas fa-globe-americas"></i>
                </button>
            `;
            return div;
        };
        locateButton.addTo(this.map);

        // Add event listeners
        setTimeout(() => {
            document.getElementById('locate-me').addEventListener('click', () => this.locateUser());
            document.getElementById('reset-view').addEventListener('click', () => this.resetView());
        }, 100);
    }

    updateMarkers(items) {
        // Clear existing markers
        this.clusterGroup.clearLayers();
        this.markers = [];

        // Add new markers
        items.forEach(item => {
            if (item.location) {
                const marker = this.createMarker(item);
                this.markers.push(marker);
                this.clusterGroup.addLayer(marker);
            }
        });

        // Fit map to show all markers
        if (this.markers.length > 0) {
            const group = new L.featureGroup(this.markers);
            this.map.fitBounds(group.getBounds(), { padding: [20, 20] });
        }
    }

    createMarker(item) {
        const marker = L.marker([item.location.lat, item.location.lng], {
            icon: this.createCustomIcon(item)
        });

        // Add popup
        const popupContent = this.createPopupContent(item);
        marker.bindPopup(popupContent);

        // Add click handler
        marker.on('click', () => {
            this.highlightMarker(marker);
            this.showItemDetails(item);
        });

        return marker;
    }

    createCustomIcon(item) {
        return L.divIcon({
            className: `map-marker ${item.type}`,
            html: `
                <div class="marker-content">
                    <i class="fas ${this.getTypeIcon(item.type)}"></i>
                </div>
            `,
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });
    }

    getTypeIcon(type) {
        const icons = {
            destination: 'fa-map-marker-alt',
            hotel: 'fa-hotel',
            flight: 'fa-plane'
        };
        return icons[type] || 'fa-map-marker-alt';
    }

    createPopupContent(item) {
        return `
            <div class="map-popup">
                <h3>${item.name}</h3>
                <p>${item.description}</p>
                <div class="popup-meta">
                    <span class="rating">
                        <i class="fas fa-star"></i> ${item.rating}
                    </span>
                    <span class="price">
                        $${item.price}
                    </span>
                </div>
                <button class="btn-primary btn-small" onclick="window.advancedSearch.viewItemDetails('${item.id}')">
                    View Details
                </button>
            </div>
        `;
    }

    highlightMarker(marker) {
        // Remove highlight from all markers
        this.markers.forEach(m => {
            m.getElement().classList.remove('highlight');
        });

        // Add highlight to clicked marker
        marker.getElement().classList.add('highlight');
        
        // Open popup
        marker.openPopup();
    }

    showItemDetails(item) {
        // Implementation to show item details in sidebar
        const detailsContainer = document.getElementById('map-item-details');
        if (detailsContainer) {
            detailsContainer.innerHTML = this.createDetailsContent(item);
            detailsContainer.style.display = 'block';
        }
    }

    createDetailsContent(item) {
        return `
            <div class="item-details">
                <div class="details-header">
                    <img src="${item.image}" alt="${item.name}">
                    <h3>${item.name}</h3>
                    <p>${item.description}</p>
                </div>
                <div class="details-meta">
                    <div class="meta-item">
                        <i class="fas fa-star"></i>
                        <span>${item.rating} Rating</span>
                    </div>
                    <div class="meta-item">
                        <i class="fas fa-dollar-sign"></i>
                        <span>From $${item.price}</span>
                    </div>
                </div>
                <div class="details-actions">
                    <button class="btn-primary" onclick="window.advancedSearch.viewItemDetails('${item.id}')">
                        View Full Details
                    </button>
                    <button class="btn-outline">
                        <i class="far fa-heart"></i> Save
                    </button>
                </div>
            </div>
        `;
    }

    locateUser() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    this.map.setView([latitude, longitude], 13);
                    
                    // Add user location marker
                    L.marker([latitude, longitude], {
                        icon: L.divIcon({
                            className: 'user-location-marker',
                            html: '<i class="fas fa-user"></i>',
                            iconSize: [20, 20],
                            iconAnchor: [10, 10]
                        })
                    }).addTo(this.map)
                    .bindPopup('Your current location')
                    .openPopup();
                },
                (error) => {
                    console.error('Error getting location:', error);
                    alert('Unable to get your current location. Please check your browser permissions.');
                }
            );
        } else {
            alert('Geolocation is not supported by this browser.');
        }
    }

    resetView() {
        this.map.setView([20, 0], 2);
    }

    // Filter markers by criteria
    filterMarkers(criteria) {
        this.markers.forEach(marker => {
            const item = marker.item;
            const visible = this.matchesCriteria(item, criteria);
            if (visible) {
                this.clusterGroup.addLayer(marker);
            } else {
                this.clusterGroup.removeLayer(marker);
            }
        });
    }

    matchesCriteria(item, criteria) {
        // Implement filtering logic based on criteria
        return true; // Placeholder
    }
}

// Initialize map when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const mapContainer = document.getElementById('search-map');
    if (mapContainer) {
        window.searchMap = new SearchMap('search-map');
    }
});