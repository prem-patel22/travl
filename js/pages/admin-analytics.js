// Admin Analytics & Reports
class AdminAnalytics {
    constructor() {
        this.analyticsData = {};
        this.period = 30; // days
        this.init();
    }

    init() {
        this.checkAdminAccess();
        this.loadAnalyticsData();
        this.setupCharts();
        this.setupEventListeners();
    }

    async loadAnalyticsData() {
        try {
            this.analyticsData = await this.fetchAnalyticsData();
            this.updateMetrics();
            this.renderDestinationPerformance();
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            this.showError('Failed to load analytics data');
        }
    }

    async fetchAnalyticsData() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    revenue: this.generateTimeSeriesData(10000, 50000),
                    bookings: this.generateTimeSeriesData(500, 2000),
                    conversionRate: this.generateTimeSeriesData(2.5, 4.5),
                    avgBookingValue: this.generateTimeSeriesData(350, 500),
                    sources: {
                        direct: 35,
                        social: 25,
                        search: 20,
                        email: 15,
                        referral: 5
                    },
                    acquisition: {
                        organic: 40,
                        paid: 25,
                        social: 20,
                        referral: 15
                    },
                    destinationPerformance: [
                        { name: 'Bali, Indonesia', bookings: 247, revenue: 468520, avgValue: 1897, growth: 12.5, rating: 4.8 },
                        { name: 'Paris, France', bookings: 189, revenue: 412350, avgValue: 2181, growth: 8.3, rating: 4.9 },
                        { name: 'Tokyo, Japan', bookings: 156, revenue: 389120, avgValue: 2494, growth: 15.2, rating: 4.7 },
                        { name: 'New York, USA', bookings: 134, revenue: 321890, avgValue: 2402, growth: 5.7, rating: 4.6 },
                        { name: 'Sydney, Australia', bookings: 98, revenue: 245670, avgValue: 2507, growth: 9.8, rating: 4.5 }
                    ]
                });
            }, 1500);
        });
    }

    generateTimeSeriesData(min, max) {
        const data = [];
        const points = this.period;
        let current = (min + max) / 2;
        
        for (let i = 0; i < points; i++) {
            const change = (Math.random() - 0.5) * (max - min) * 0.1;
            current = Math.max(min, Math.min(max, current + change));
            data.push(Math.round(current));
        }
        
        return data;
    }

    updateMetrics() {
        // Update metric cards with latest values
        const revenue = this.analyticsData.revenue[this.analyticsData.revenue.length - 1];
        const bookings = this.analyticsData.bookings[this.analyticsData.bookings.length - 1];
        const conversion = this.analyticsData.conversionRate[this.analyticsData.conversionRate.length - 1];
        const abv = this.analyticsData.avgBookingValue[this.analyticsData.avgBookingValue.length - 1];

        document.querySelector('.metric-card:nth-child(1) .metric-value').textContent = `$${revenue.toLocaleString()}`;
        document.querySelector('.metric-card:nth-child(2) .metric-value').textContent = bookings.toLocaleString();
        document.querySelector('.metric-card:nth-child(3) .metric-value').textContent = `${conversion.toFixed(1)}%`;
        document.querySelector('.metric-card:nth-child(4) .metric-value').textContent = `$${abv}`;
    }

    setupCharts() {
        this.setupMiniCharts();
        this.setupRevenueTrendChart();
        this.setupSourcesChart();
        this.setupAcquisitionChart();
    }

    setupMiniCharts() {
        // Revenue mini chart
        this.createMiniChart('revenue-mini-chart', this.analyticsData.revenue, '#10b981');
        // Bookings mini chart
        this.createMiniChart('bookings-mini-chart', this.analyticsData.bookings, '#3b82f6');
        // Conversion mini chart
        this.createMiniChart('conversion-mini-chart', this.analyticsData.conversionRate, '#8b5cf6');
        // ABV mini chart
        this.createMiniChart('abv-mini-chart', this.analyticsData.avgBookingValue, '#f59e0b');
    }

    createMiniChart(canvasId, data, color) {
        const ctx = document.getElementById(canvasId).getContext('2d');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.map((_, i) => ''),
                datasets: [{
                    data: data,
                    borderColor: color,
                    backgroundColor: color + '20',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: false }
                },
                scales: {
                    x: { display: false },
                    y: { display: false }
                },
                elements: {
                    point: { radius: 0 }
                }
            }
        });
    }

    setupRevenueTrendChart() {
        const ctx = document.getElementById('revenue-trend-chart').getContext('2d');
        
        this.revenueChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: this.generateDateLabels(),
                datasets: [
                    {
                        label: 'Revenue',
                        data: this.analyticsData.revenue,
                        borderColor: '#10b981',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y'
                    },
                    {
                        label: 'Bookings',
                        data: this.analyticsData.bookings,
                        borderColor: '#3b82f6',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        borderWidth: 2,
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y1'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                scales: {
                    x: {
                        grid: { display: false }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        ticks: {
                            callback: function(value) {
                                return '$' + value.toLocaleString();
                            }
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        grid: { drawOnChartArea: false }
                    }
                },
                plugins: {
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                let label = context.dataset.label || '';
                                if (label) {
                                    label += ': ';
                                }
                                if (context.dataset.label === 'Revenue') {
                                    label += '$' + context.parsed.y.toLocaleString();
                                } else {
                                    label += context.parsed.y.toLocaleString();
                                }
                                return label;
                            }
                        }
                    }
                }
            }
        });
    }

    setupSourcesChart() {
        const ctx = document.getElementById('sources-chart').getContext('2d');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(this.analyticsData.sources).map(key => 
                    key.charAt(0).toUpperCase() + key.slice(1)
                ),
                datasets: [{
                    data: Object.values(this.analyticsData.sources),
                    backgroundColor: [
                        '#2563eb', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { position: 'bottom' }
                },
                cutout: '60%'
            }
        });
    }

    setupAcquisitionChart() {
        const ctx = document.getElementById('acquisition-chart').getContext('2d');
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Object.keys(this.analyticsData.acquisition).map(key => 
                    key.charAt(0).toUpperCase() + key.slice(1)
                ),
                datasets: [{
                    data: Object.values(this.analyticsData.acquisition),
                    backgroundColor: '#2563eb',
                    borderWidth: 0,
                    borderRadius: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    generateDateLabels() {
        const labels = [];
        const now = new Date();
        
        for (let i = this.period - 1; i >= 0; i--) {
            const date = new Date(now);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
        }
        
        return labels;
    }

    renderDestinationPerformance() {
        const container = document.getElementById('destination-performance');
        if (!container) return;

        container.innerHTML = this.analyticsData.destinationPerformance.map(dest => `
            <tr>
                <td>
                    <div class="destination-info-cell">
                        <strong>${dest.name}</strong>
                    </div>
                </td>
                <td>${dest.bookings}</td>
                <td>$${dest.revenue.toLocaleString()}</td>
                <td>$${dest.avgValue}</td>
                <td>
                    <span class="growth-badge ${dest.growth > 0 ? 'positive' : 'negative'}">
                        ${dest.growth > 0 ? '+' : ''}${dest.growth}%
                    </span>
                </td>
                <td>
                    <div class="rating-stars">
                        <i class="fas fa-star"></i>
                        <span>${dest.rating}</span>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    setupEventListeners() {
        // Period selector
        document.getElementById('analytics-period').addEventListener('change', (e) => {
            this.period = parseInt(e.target.value);
            this.loadAnalyticsData();
        });

        // Generate report
        document.getElementById('generate-report').addEventListener('click', () => {
            this.generatePDFReport();
        });
    }

    async generatePDFReport() {
        try {
            this.showLoading('Generating report...');
            
            // Simulate PDF generation
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Create and download PDF (simulated)
            const pdfUrl = this.createSimulatedPDF();
            this.downloadPDF(pdfUrl, `travl-analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
            
            this.showSuccess('Report generated successfully');
        } catch (error) {
            this.showError('Failed to generate report');
        } finally {
            this.hideLoading();
        }
    }

    createSimulatedPDF() {
        // In a real implementation, this would generate an actual PDF
        // For demo, we'll create a simple text file
        const content = this.generateReportContent();
        const blob = new Blob([content], { type: 'text/plain' });
        return URL.createObjectURL(blob);
    }

    generateReportContent() {
        const date = new Date().toLocaleDateString();
        let content = `TRAVL ANALYTICS REPORT\n`;
        content += `Generated on: ${date}\n\n`;
        content += `PERFORMANCE SUMMARY\n`;
        content += `===================\n`;
        content += `Total Revenue: $${this.analyticsData.revenue[this.analyticsData.revenue.length - 1].toLocaleString()}\n`;
        content += `Total Bookings: ${this.analyticsData.bookings[this.analyticsData.bookings.length - 1].toLocaleString()}\n`;
        content += `Conversion Rate: ${this.analyticsData.conversionRate[this.analyticsData.conversionRate.length - 1].toFixed(1)}%\n\n`;
        
        content += `TOP DESTINATIONS\n`;
        content += `================\n`;
        this.analyticsData.destinationPerformance.forEach(dest => {
            content += `${dest.name}: $${dest.revenue.toLocaleString()} (${dest.bookings} bookings)\n`;
        });
        
        return content;
    }

    downloadPDF(url, filename) {
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    showLoading(message) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-overlay';
        loadingDiv.innerHTML = `
            <div class="loading-content">
                <div class="loading-spinner large"></div>
                <p>${message}</p>
            </div>
        `;
        document.body.appendChild(loadingDiv);
    }

    hideLoading() {
        const loadingDiv = document.querySelector('.loading-overlay');
        if (loadingDiv) {
            loadingDiv.remove();
        }
    }

    checkAdminAccess() {
        const currentUser = window.authSystem?.getCurrentUser();
        if (!currentUser || !currentUser.isAdmin) {
            window.location.href = '../../index.html';
            return;
        }
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `admin-notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-triangle'}"></i>
                <span>${message}</span>
                <button class="notification-close">&times;</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 5000);
        
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.remove();
        });
    }
}

// Initialize admin analytics
document.addEventListener('DOMContentLoaded', () => {
    new AdminAnalytics();
});