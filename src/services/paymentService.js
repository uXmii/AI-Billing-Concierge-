// services/paymentService.js// services/paymentService.js
class PaymentService {
    constructor() {
        this.paymentMethods = [
            {
                id: 'visa-4532',
                type: 'card',
                brand: 'Visa',
                last4: '4532',
                holder: 'John Doe',
                expiry: '12/27',
                isDefault: true
            },
            {
                id: 'mastercard-8901',
                type: 'card',
                brand: 'MasterCard',
                last4: '8901',
                holder: 'Jane Smith',
                expiry: '08/26',
                isDefault: false
            },
            {
                id: 'amex-1234',
                type: 'card',
                brand: 'American Express',
                last4: '1234',
                holder: 'Business Account',
                expiry: '03/28',
                isDefault: false
            },
            {
                id: 'chase-5678',
                type: 'bank',
                bank: 'Chase',
                accountType: 'Checking',
                last4: '5678',
                holder: 'John Doe',
                isDefault: false
            },
            {
                id: 'bofa-9012',
                type: 'bank',
                bank: 'Bank of America',
                accountType: 'Savings',
                last4: '9012',
                holder: 'Jane Smith',
                isDefault: false
            },
            {
                id: 'wells-3456',
                type: 'bank',
                bank: 'Wells Fargo',
                accountType: 'Business',
                last4: '3456',
                holder: 'Business Account',
                isDefault: false
            }
        ];

        this.paymentHistory = [
            {
                id: 'PAY-001',
                company: 'Pacific Gas & Electric',
                amount: 234.56,
                date: '2024-01-15',
                method: 'Visa •••• 4532',
                status: 'completed',
                confirmationNumber: 'PG-789123'
            },
            {
                id: 'PAY-002',
                company: 'City Water Department',
                amount: 87.23,
                date: '2024-01-10',
                method: 'Chase Checking •••• 5678',
                status: 'completed',
                confirmationNumber: 'CW-456789'
            },
            {
                id: 'PAY-003',
                company: 'Natural Gas Company',
                amount: 156.78,
                date: '2024-01-05',
                method: 'MasterCard •••• 8901',
                status: 'completed',
                confirmationNumber: 'NG-321654'
            },
            {
                id: 'PAY-004',
                company: 'Electric Company',
                amount: 189.45,
                date: '2023-12-20',
                method: 'Visa •••• 4532',
                status: 'completed',
                confirmationNumber: 'EC-987654'
            },
            {
                id: 'PAY-005',
                company: 'Internet Service',
                amount: 79.99,
                date: '2023-12-15',
                method: 'American Express •••• 1234',
                status: 'failed',
                confirmationNumber: null
            }
        ];

        this.selectedBills = ['1'];
        this.autopaySettings = {
            enabled: false,
            method: 'visa-4532',
            timing: '3-days-early',
            maxAmount: 500.00,
            notifications: {
                email: true,
                sms: true,
                push: false
            },
            bills: {
                electric: true,
                gas: true,
                water: false,
                internet: false
            }
        };
    }

    // Initialize payment system
    init() {
        this.initializePaymentTabs();
        this.initializeBillSelection();
        this.initializePaymentDate();
        this.renderPaymentMethods();
        this.renderPaymentHistory();
        this.loadAutopaySettings();
    }

    // Initialize payment tabs
    initializePaymentTabs() {
        document.querySelectorAll('[data-payment-tab]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tabName = e.target.dataset.paymentTab;
                this.switchPaymentTab(tabName);
            });
        });
    }

    // Switch payment tabs
    switchPaymentTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('[data-payment-tab]').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.paymentTab === tabName) {
                btn.classList.add('active');
            }
        });

        // Update tab content
        document.querySelectorAll('.payment-tab-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(tabName).classList.add('active');

        // Add AI message for tab switching
        if (tabName === 'payment-history') {
            billingConcierge.addAIMessage('Here\'s your payment history. I notice you have a 98.5% success rate and typically pay bills 3 days early. Excellent payment discipline!');
        } else if (tabName === 'autopay') {
            billingConcierge.addAIMessage('AutoPay can save you time and help avoid late fees. I recommend setting it up for your recurring bills with a backup payment method.');
        } else if (tabName === 'payment-methods') {
            billingConcierge.addAIMessage('Here are your saved payment methods. I can help you add new methods, set defaults, or remove old ones securely.');
        }
    }

    // Initialize bill selection
    initializeBillSelection() {
        document.querySelectorAll('.bill-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const billId = e.currentTarget.dataset.billId;
                this.toggleBillSelection(billId);
            });
        });
    }

    // Toggle bill selection
    toggleBillSelection(billId) {
        const billElement = document.querySelector(`[data-bill-id="${billId}"]`);
        const isSelected = billElement.classList.contains('selected');

        if (isSelected) {
            billElement.classList.remove('selected');
            this.selectedBills = this.selectedBills.filter(id => id !== billId);
        } else {
            billElement.classList.add('selected');
            this.selectedBills.push(billId);
        }

        this.updatePaymentSummary();
    }

    // Update payment summary
    updatePaymentSummary() {
        const bills = {
            '1': { amount: 234.56, dueDate: 'Feb 20, 2024' },
            '2': { amount: 87.23, dueDate: 'Feb 15, 2024' },
            '3': { amount: 156.78, dueDate: 'Feb 25, 2024' }
        };

        const totalAmount = this.selectedBills.reduce((sum, id) => sum + bills[id].amount, 0);
        const earliestDue = this.selectedBills.map(id => bills[id].dueDate).sort()[0];

        document.getElementById('selectedBillsCount').textContent = this.selectedBills.length;
        document.getElementById('totalSelectedAmount').textContent = `$${totalAmount.toFixed(2)}`;
        document.getElementById('nextDueDate').textContent = earliestDue || 'N/A';
        document.getElementById('paymentAmount').value = totalAmount.toFixed(2);
    }

    // Initialize payment date
    initializePaymentDate() {
    const today = new Date();
    const dateInput = document.getElementById('paymentDate');
    
    if (dateInput) {
        // Set today as default
        const formattedDate = today.toISOString().split('T')[0];
        dateInput.value = formattedDate;
        
        // Set min date to today (can't pay in the past)
        dateInput.min = formattedDate;
        
        // Set max date to 30 days from today (reasonable future limit)
        const maxDate = new Date(today.getTime() + (30 * 24 * 60 * 60 * 1000));
        dateInput.max = maxDate.toISOString().split('T')[0];
        
        // Add event listener to validate date selection
        dateInput.addEventListener('change', function() {
            const selectedDate = new Date(this.value);
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Reset time for comparison
            
            if (selectedDate < today) {
                showNotification('Cannot schedule payments in the past. Setting to today.', 'warning');
                this.value = today.toISOString().split('T')[0];
                addAIMessage('⚠️ Payment date adjusted to today. You cannot schedule payments in the past for security reasons.');
            } else if (selectedDate > maxDate) {
                showNotification('Cannot schedule payments more than 30 days ahead. Setting to maximum allowed date.', 'warning');
                this.value = maxDate.toISOString().split('T')[0];
                addAIMessage('⚠️ Payment date adjusted to maximum allowed (30 days ahead). For longer scheduling, use AutoPay instead.');
            } else {
                // Valid date selected
                const daysFromNow = Math.ceil((selectedDate - today) / (24 * 60 * 60 * 1000));
                if (daysFromNow > 0) {
                    addAIMessage(`📅 Payment scheduled for ${selectedDate.toLocaleDateString()} (${daysFromNow} days from now). This timing looks good for your cash flow!`);
                }
            }
        });
    }
}

    // Process payment - COMPLETE WORKING VERSION
    async processPayment() {
        console.log('🔄 Processing payment...');
        
        const amount = parseFloat(document.getElementById('paymentAmount').value);
        const methodId = document.getElementById('paymentMethod').value;
        const date = document.getElementById('paymentDate').value;
        const autopay = document.getElementById('saveAsAutopay').checked;

        // Validation
        if (amount <= 0) {
            this.showNotification('Please enter a valid payment amount.', 'error');
            return;
        }

        if (this.selectedBills.length === 0) {
            this.showNotification('Please select at least one bill to pay.', 'error');
            return;
        }

        // Show processing notification
        this.showNotification('Processing your payment... Please wait.', 'info');
        
        // Disable pay button
        const payButton = document.querySelector('.pay-btn');
        if (payButton) {
            payButton.disabled = true;
            payButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        }

        // Add AI message
        if (typeof billingConcierge !== 'undefined') {
            billingConcierge.addAIMessage('🔒 Processing your payment securely... Validating payment method and verifying transaction details.');
        }

        try {
            // Simulate payment processing delay
            await this.simulatePaymentProcessing();

            // AI fraud detection simulation
            if (amount > 300) {
                if (typeof billingConcierge !== 'undefined') {
                    billingConcierge.addAIMessage('🛡️ AI Security Alert: Large payment detected ($' + amount.toFixed(2) + '). Running enhanced fraud detection... ✅ Transaction verified as legitimate.');
                }
                await this.delay(1000);
            }

            // Get payment method details
            const paymentMethod = this.getPaymentMethodName(methodId);
            
            // Create payment record
            const paymentData = {
                id: 'PAY-' + String(this.paymentHistory.length + 1).padStart(3, '0'),
                amount: amount,
                method: paymentMethod,
                date: date,
                confirmationNumber: this.generateConfirmationNumber(),
                bills: this.selectedBills.length,
                selectedBillIds: [...this.selectedBills]
            };

            // Add to payment history
            this.addPaymentToHistory(paymentData);

            // Remove paid bills from pending
            this.removePaidBills();

            // Show success notification
            this.showNotification('Payment successful! $' + amount.toFixed(2) + ' processed.', 'success');

            // Show detailed confirmation modal
            this.showPaymentConfirmation(paymentData);

            // AI success message
            if (typeof billingConcierge !== 'undefined') {
                billingConcierge.addAIMessage(`✅ Payment Complete! Your payment of $${amount.toFixed(2)} has been processed successfully using ${paymentMethod}. Confirmation number: ${paymentData.confirmationNumber}`);
            }

            // Setup autopay if requested
            if (autopay) {
                this.setupAutopayFromPayment(methodId);
                if (typeof billingConcierge !== 'undefined') {
                    billingConcierge.addAIMessage('🔄 AutoPay has been activated! Future bills will be paid automatically using your selected payment method.');
                }
            }

            // Reset form
            this.resetPaymentForm();

            // AI insights after payment
            setTimeout(() => {
                if (typeof billingConcierge !== 'undefined') {
                    billingConcierge.addAIMessage('📊 Payment Analytics: You\'ve now paid $' + (2847.65 + amount).toFixed(2) + ' in utilities this year. Your consistent early payment pattern has saved you approximately $95 in late fees.');
                }
            }, 3000);

        } catch (error) {
            console.error('Payment error:', error);
            // Handle payment failure
            this.showNotification('Payment failed. Please try again.', 'error');
            if (typeof billingConcierge !== 'undefined') {
                billingConcierge.addAIMessage('❌ Payment failed. Please check your payment method and try again. If the issue persists, I can help you troubleshoot.');
            }
        } finally {
            // Re-enable pay button
            if (payButton) {
                payButton.disabled = false;
                payButton.innerHTML = '<i class="fas fa-lock"></i> Pay Securely';
            }
        }
    }

    // Show notification - COMPLETE WORKING VERSION
    showNotification(message, type) {
        console.log(`📢 Notification: ${type} - ${message}`);
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas ${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Trigger animation
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after delay
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 4000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fa-check-circle',
            'error': 'fa-exclamation-circle',
            'info': 'fa-info-circle',
            'warning': 'fa-exclamation-triangle'
        };
        return icons[type] || 'fa-info-circle';
    }

    removePaidBills() {
        this.selectedBills.forEach(billId => {
            const billElement = document.querySelector(`[data-bill-id="${billId}"]`);
            if (billElement) {
                billElement.style.transition = 'opacity 0.5s ease';
                billElement.style.opacity = '0.5';
                billElement.innerHTML = `
                    <div class="bill-header">
                        <div class="bill-company">✅ Payment Processed</div>
                        <div class="bill-amount" style="color: #27ae60;">PAID</div>
                    </div>
                    <div class="bill-details">
                        <div class="bill-period">Payment successful</div>
                        <div class="due-date">Processed today</div>
                    </div>
                `;
                
                setTimeout(() => {
                    billElement.style.display = 'none';
                }, 2000);
            }
        });
        
        this.selectedBills = [];
        this.updatePaymentSummary();
    }

    resetPaymentForm() {
        document.getElementById('paymentAmount').value = '0.00';
        document.getElementById('saveAsAutopay').checked = false;
        this.updatePaymentSummary();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Simulate payment processing
    async simulatePaymentProcessing() {
        const steps = ['Validating payment method', 'Processing transaction', 'Updating account', 'Generating confirmation'];
        
        for (let i = 0; i < steps.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Generate confirmation number
    generateConfirmationNumber() {
        const prefix = 'AI-';
        const number = Math.floor(100000 + Math.random() * 900000);
        return prefix + number;
    }

    // Get payment method name
    getPaymentMethodName(methodId) {
        const method = this.paymentMethods.find(m => m.id === methodId);
        if (!method) return 'Unknown';
        
        if (method.type === 'card') {
            return `${method.brand} •••• ${method.last4}`;
        } else {
            return `${method.bank} ${method.accountType} •••• ${method.last4}`;
        }
    }

    // Add payment to history
    addPaymentToHistory(paymentData) {
        const newPayment = {
            id: 'PAY-' + String(this.paymentHistory.length + 1).padStart(3, '0'),
            company: 'Multiple Bills',
            amount: paymentData.amount,
            date: paymentData.date,
            method: paymentData.method,
            status: 'completed',
            confirmationNumber: paymentData.confirmationNumber
        };

        this.paymentHistory.unshift(newPayment);
        this.renderPaymentHistory();
    }

    // Show payment confirmation
    showPaymentConfirmation(paymentData) {
        const modal = document.getElementById('confirmationModal');
        const title = document.getElementById('confirmationTitle');
        const message = document.getElementById('confirmationMessage');
        const details = document.getElementById('confirmationDetails');

        if (modal && title && message && details) {
            title.textContent = 'Payment Successful!';
            message.textContent = 'Your payment has been processed successfully.';
            
            details.innerHTML = `
                <div class="detail-row">
                    <span>Amount:</span>
                    <span>$${paymentData.amount.toFixed(2)}</span>
                </div>
                <div class="detail-row">
                    <span>Payment Method:</span>
                    <span>${paymentData.method}</span>
                </div>
                <div class="detail-row">
                    <span>Date:</span>
                    <span>${paymentData.date}</span>
                </div>
                <div class="detail-row">
                    <span>Confirmation:</span>
                    <span>${paymentData.confirmationNumber}</span>
                </div>
                <div class="detail-row">
                    <span>Bills Paid:</span>
                    <span>${paymentData.bills}</span>
                </div>
            `;

            modal.style.display = 'block';
        }
    }

    // Close confirmation modal
    closeConfirmation() {
        const modal = document.getElementById('confirmationModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Show add payment method modal
    showAddPaymentMethodModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'block';
            this.showNotification('Add a new payment method securely', 'info');
            if (typeof billingConcierge !== 'undefined') {
                billingConcierge.addAIMessage('I\'ll help you add a new payment method securely. All information is encrypted and stored safely.');
            }
        }
    }

    // Close modal
    closeModal() {
        const modal = document.getElementById('paymentModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // Toggle payment form
    togglePaymentForm() {
        const paymentType = document.getElementById('paymentType').value;
        const cardForm = document.getElementById('cardForm');
        const bankForm = document.getElementById('bankForm');

        if (paymentType === 'card') {
            cardForm.style.display = 'block';
            bankForm.style.display = 'none';
        } else {
            cardForm.style.display = 'none';
            bankForm.style.display = 'block';
        }
    }

    // Save payment method
    savePaymentMethod() {
        const paymentType = document.getElementById('paymentType').value;
        let newMethod;

        if (paymentType === 'card') {
            const cardNumber = document.getElementById('cardNumber').value;
            const cardHolder = document.getElementById('cardholderName').value;
            const expiry = document.getElementById('expiryDate').value;

            if (!cardNumber || !cardHolder || !expiry) {
                this.showNotification('Please fill in all required fields.', 'error');
                return;
            }

            newMethod = {
                id: 'card-' + Date.now(),
                type: 'card',
                brand: this.detectCardBrand(cardNumber),
                last4: cardNumber.slice(-4),
                holder: cardHolder,
                expiry: expiry,
                isDefault: false
            };
        } else {
            const bankName = document.getElementById('bankName').value;
            const accountNumber = document.getElementById('accountNumber').value;
            const accountType = document.getElementById('accountType').value;

            if (!bankName || !accountNumber || !accountType) {
                this.showNotification('Please fill in all required fields.', 'error');
                return;
            }

            newMethod = {
                id: 'bank-' + Date.now(),
                type: 'bank',
                bank: bankName,
                accountType: accountType,
                last4: accountNumber.slice(-4),
                holder: 'Account Holder',
                isDefault: false
            };
        }

        this.paymentMethods.push(newMethod);
        this.renderPaymentMethods();
        this.updatePaymentMethodDropdowns();
        this.closeModal();

        this.showNotification('Payment method added successfully!', 'success');
        if (typeof billingConcierge !== 'undefined') {
            billingConcierge.addAIMessage(`✅ Payment method added successfully! Your ${paymentType === 'card' ? 'card' : 'bank account'} ending in ${newMethod.last4} is now available for payments.`);
        }
    }

    // Detect card brand
    detectCardBrand(cardNumber) {
        const number = cardNumber.replace(/\D/g, '');
        if (number.match(/^4/)) return 'Visa';
        if (number.match(/^5[1-5]/)) return 'MasterCard';
        if (number.match(/^3[47]/)) return 'American Express';
        return 'Unknown';
    }

    // Render payment methods
    renderPaymentMethods() {
        const grid = document.getElementById('paymentMethodsGrid');
        if (!grid) return;
        
        grid.innerHTML = '<div style="text-align: center; padding: 20px; color: #7f8c8d;">Loading payment methods...</div>';

        setTimeout(() => {
            grid.innerHTML = '';
            
            this.paymentMethods.forEach((method, index) => {
                const card = document.createElement('div');
                card.className = `payment-method-card ${method.isDefault ? 'default' : ''}`;
                card.style.animation = `fadeIn 0.5s ease ${index * 0.1}s both`;
                
                if (method.type === 'card') {
                    card.innerHTML = `
                        <div class="method-header">
                            <div class="card-brand">${this.getCardIcon(method.brand)} ${method.brand}</div>
                            ${method.isDefault ? '<div class="default-badge">Default</div>' : ''}
                        </div>
                        <div class="card-number">•••• •••• •••• ${method.last4}</div>
                        <div class="card-holder">${method.holder}</div>
                        <div class="card-expiry">Expires: ${method.expiry}</div>
                        <div class="card-actions">
                            ${!method.isDefault ? `<button class="set-default-btn" onclick="paymentSystem.setDefaultPaymentMethod('${method.id}')">Set as Default</button>` : ''}
                            <button class="remove-btn" onclick="paymentSystem.removePaymentMethod('${method.id}')">Remove</button>
                        </div>
                    `;
                } else {
                    card.innerHTML = `
                        <div class="method-header">
                            <div class="card-brand">${this.getBankIcon(method.bank)} ${method.bank}</div>
                            ${method.isDefault ? '<div class="default-badge">Default</div>' : ''}
                        </div>
                        <div class="card-number">${method.accountType} •••• ${method.last4}</div>
                        <div class="card-holder">${method.holder}</div>
                        <div class="bank-type">Account Type: ${method.accountType}</div>
                        <div class="card-actions">
                            ${!method.isDefault ? `<button class="set-default-btn" onclick="paymentSystem.setDefaultPaymentMethod('${method.id}')">Set as Default</button>` : ''}
                            <button class="remove-btn" onclick="paymentSystem.removePaymentMethod('${method.id}')">Remove</button>
                        </div>
                    `;
                }

                grid.appendChild(card);
            });

            if (this.paymentMethods.length > 0 && typeof billingConcierge !== 'undefined') {
                billingConcierge.addAIMessage(`I've loaded your ${this.paymentMethods.length} payment methods. You have ${this.paymentMethods.filter(m => m.type === 'card').length} cards and ${this.paymentMethods.filter(m => m.type === 'bank').length} bank accounts. Your default method is ${this.getPaymentMethodName(this.paymentMethods.find(m => m.isDefault).id)}.`);
            }
        }, 800);
    }

    // Get card icon
    getCardIcon(brand) {
        const icons = {
            'Visa': '💳',
            'MasterCard': '💳',
            'American Express': '💳'
        };
        return icons[brand] || '💳';
    }

    // Get bank icon
    getBankIcon(bank) {
        return '🏦';
    }

    // Set default payment method
    setDefaultPaymentMethod(methodId) {
        const oldDefault = this.paymentMethods.find(m => m.isDefault);
        
        this.paymentMethods.forEach(method => {
            method.isDefault = method.id === methodId;
        });
        
        this.renderPaymentMethods();
        this.updatePaymentMethodDropdowns();
        
        this.showNotification('Default payment method updated!', 'success');
        if (typeof billingConcierge !== 'undefined') {
            billingConcierge.addAIMessage(`✅ Default payment method updated to ${this.getPaymentMethodName(methodId)}. This will be used for AutoPay and quick payments.`);
        }
    }

    // Remove payment method
    removePaymentMethod(methodId) {
        const method = this.paymentMethods.find(m => m.id === methodId);
        if (method && method.isDefault) {
            this.showNotification('Cannot remove the default payment method. Please set another method as default first.', 'error');
            return;
        }

        this.paymentMethods = this.paymentMethods.filter(m => m.id !== methodId);
        this.renderPaymentMethods();
        this.updatePaymentMethodDropdowns();
        
        this.showNotification('Payment method removed successfully!', 'success');
        if (typeof billingConcierge !== 'undefined') {
            billingConcierge.addAIMessage(`Payment method removed successfully. You now have ${this.paymentMethods.length} payment methods available.`);
        }
    }

    // Update payment method dropdowns
    updatePaymentMethodDropdowns() {
        const dropdowns = ['paymentMethod', 'autopayMethod'];
        
        dropdowns.forEach(dropdownId => {
            const dropdown = document.getElementById(dropdownId);
            if (dropdown) {
                dropdown.innerHTML = '';
                
                this.paymentMethods.forEach(method => {
                    const option = document.createElement('option');
                    option.value = method.id;
                    option.textContent = this.getPaymentMethodName(method.id);
                    dropdown.appendChild(option);
                });
            }
        });
    }

    // Render payment history
    renderPaymentHistory() {
        const list = document.getElementById('paymentHistoryList');
        if (!list) return;
        
        list.innerHTML = '';

        this.paymentHistory.forEach(payment => {
            const item = document.createElement('div');
            item.className = 'payment-item';
            item.innerHTML = `
                <div class="payment-status ${payment.status}"></div>
                <div class="payment-info">
                    <h4>${payment.company}</h4>
                    <p>${payment.confirmationNumber || 'No confirmation'}</p>
                </div>
                <div class="payment-method-info">
                    <div>${payment.method}</div>
                </div>
                <div class="payment-amount">$${payment.amount.toFixed(2)}</div>
                <div class="payment-date">${payment.date}</div>
            `;
            list.appendChild(item);
        });
    }

    // Search payments
    searchPayments() {
        const searchTerm = document.getElementById('paymentSearch').value.toLowerCase();
        const filteredHistory = this.paymentHistory.filter(payment => 
            payment.company.toLowerCase().includes(searchTerm) ||
            payment.method.toLowerCase().includes(searchTerm) ||
            payment.confirmationNumber?.toLowerCase().includes(searchTerm)
        );

        if (typeof billingConcierge !== 'undefined') {
            billingConcierge.addAIMessage(`Found ${filteredHistory.length} payments matching "${searchTerm}". ${filteredHistory.length === 0 ? 'Try different search terms.' : 'Results displayed below.'}`);
        }
        
        this.renderFilteredPayments(filteredHistory);
    }

    // Apply filters
    applyFilters() {
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFilter = document.getElementById('dateFilter').value;
        
        let filteredHistory = this.paymentHistory;

        if (statusFilter) {
            filteredHistory = filteredHistory.filter(payment => payment.status === statusFilter);
        }

        if (dateFilter) {
            filteredHistory = filteredHistory.filter(payment => payment.date >= dateFilter);
        }

        if (typeof billingConcierge !== 'undefined') {
            billingConcierge.addAIMessage(`Applied filters: ${statusFilter || 'All status'}, ${dateFilter || 'All dates'}. Found ${filteredHistory.length} matching payments.`);
        }
        
        this.renderFilteredPayments(filteredHistory);
    }

    // Render filtered payments
    renderFilteredPayments(payments) {
        const list = document.getElementById('paymentHistoryList');
        if (!list) return;
        
        list.innerHTML = '';

        payments.forEach(payment => {
            const item = document.createElement('div');
            item.className = 'payment-item';
            item.innerHTML = `
                <div class="payment-status ${payment.status}"></div>
                <div class="payment-info">
                    <h4>${payment.company}</h4>
                    <p>${payment.confirmationNumber || 'No confirmation'}</p>
                </div>
                <div class="payment-method-info">
                    <div>${payment.method}</div>
                </div>
                <div class="payment-amount">$${payment.amount.toFixed(2)}</div>
                <div class="payment-date">${payment.date}</div>
            `;
            list.appendChild(item);
        });
    }

    // Load autopay settings
    loadAutopaySettings() {
        const autopayEnabled = document.getElementById('autopayEnabled');
        const autopayMethod = document.getElementById('autopayMethod');
        const autopayTiming = document.getElementById('autopayTiming');
        const autopayMaxAmount = document.getElementById('autopayMaxAmount');
        
        if (autopayEnabled) autopayEnabled.checked = this.autopaySettings.enabled;
        if (autopayMethod) autopayMethod.value = this.autopaySettings.method;
        if (autopayTiming) autopayTiming.value = this.autopaySettings.timing;
        if (autopayMaxAmount) autopayMaxAmount.value = this.autopaySettings.maxAmount;
    }

    // Save autopay settings
    saveAutopaySettings() {
        const wasEnabled = this.autopaySettings.enabled;
        
        this.autopaySettings.enabled = document.getElementById('autopayEnabled').checked;
        this.autopaySettings.method = document.getElementById('autopayMethod').value;
        this.autopaySettings.timing = document.getElementById('autopayTiming').value;
        this.autopaySettings.maxAmount = parseFloat(document.getElementById('autopayMaxAmount').value) || 500;
        
        this.showNotification('Saving AutoPay settings...', 'info');
        
        setTimeout(() => {
            this.showNotification('AutoPay settings saved successfully!', 'success');
            
            if (this.autopaySettings.enabled) {
                if (!wasEnabled) {
                    if (typeof billingConcierge !== 'undefined') {
                        billingConcierge.addAIMessage(`✅ AutoPay is now ACTIVE! I'll automatically pay your bills using ${this.getPaymentMethodName(this.autopaySettings.method)} with the following settings:
                        
🔹 Payment timing: ${this.getTimingDescription(this.autopaySettings.timing)}
🔹 Maximum amount: $${this.autopaySettings.maxAmount.toFixed(2)}
🔹 Notifications: Email and SMS enabled
                        
You'll receive AI-powered alerts before each payment with smart fraud detection.`);
                    }
                } else {
                    if (typeof billingConcierge !== 'undefined') {
                        billingConcierge.addAIMessage(`✅ AutoPay settings updated! Your AutoPay will now use ${this.getPaymentMethodName(this.autopaySettings.method)} and pay bills ${this.getTimingDescription(this.autopaySettings.timing)}. Maximum amount set to $${this.autopaySettings.maxAmount.toFixed(2)}.`);
                    }
                }
                
                setTimeout(() => {
                    if (typeof billingConcierge !== 'undefined') {
                        billingConcierge.addAIMessage('🤖 AI AutoPay Intelligence: I\'ve analyzed your payment patterns and optimized your AutoPay schedule. Based on your billing history, I expect to process approximately $237 monthly. You\'ll receive smart notifications 24 hours before each payment with anomaly detection.');
                    }
                }, 3000);
                
            } else {
                if (typeof billingConcierge !== 'undefined') {
                    billingConcierge.addAIMessage('⏸️ AutoPay has been disabled. You\'ll need to manually pay your bills going forward. I can still help you with payment processing and send reminders when bills are due.');
                }
            }
            
            this.updateAutopayStatus();
        }, 1500);
    }

    getTimingDescription(timing) {
        const timings = {
            'due-date': 'on the due date',
            '3-days-early': '3 days before due date',
            '5-days-early': '5 days before due date',
            '1-week-early': '1 week before due date'
        };
        return timings[timing] || 'on the due date';
    }

    updateAutopayStatus() {
        const statusElements = document.querySelectorAll('.autopay-status');
        statusElements.forEach(element => {
            element.textContent = this.autopaySettings.enabled ? 'Active' : 'Inactive';
            element.className = `autopay-status ${this.autopaySettings.enabled ? 'active' : 'inactive'}`;
        });
        
        const autopayEnabled = document.getElementById('autopayEnabled');
        if (autopayEnabled) autopayEnabled.checked = this.autopaySettings.enabled;
    }

    // Setup autopay from payment
    setupAutopayFromPayment(methodId) {
        this.autopaySettings.enabled = true;
        this.autopaySettings.method = methodId;
        this.loadAutopaySettings();
        
        if (typeof billingConcierge !== 'undefined') {
            billingConcierge.addAIMessage('🔄 AutoPay has been set up using your selected payment method. Future bills will be paid automatically based on your preferences.');
        }
    }
}

// Initialize payment system
let paymentSystem;
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Initializing Payment System...');
    paymentSystem = new PaymentService();
    paymentSystem.init();
    console.log('✅ Payment System Initialized!');
});