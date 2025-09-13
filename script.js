// Глобальные переменные
let medications = JSON.parse(localStorage.getItem('medications')) || [];
let familyMembers = JSON.parse(localStorage.getItem('familyMembers')) || [];
let selectedColor = '#FF6B6B';

// Инициализация приложения
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupEventListeners();
    updateTime();
    setInterval(updateTime, 1000);
    updateOnlineStatus();
    setInterval(updateOnlineStatus, 10000); // Обновляем каждые 10 секунд
});

// Инициализация
function initializeApp() {
    updateGreeting();
    updateStats();
    updateTodayMedications();
    updateFamilyStatus();
    updateProfileStats();
    renderMedications();
    renderFamilyMembers();
}

// Настройка обработчиков событий
function setupEventListeners() {
    // Навигация
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            switchTab(tabName);
        });
    });

    // Форма добавления лекарства
    document.getElementById('add-medication-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addMedication();
    });

    // Форма добавления члена семьи
    document.getElementById('add-family-form').addEventListener('submit', function(e) {
        e.preventDefault();
        addFamilyMember();
    });

    // Выбор цвета
    document.querySelectorAll('.color-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.color-option').forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            selectedColor = this.dataset.color;
        });
    });

    // Закрытие модальных окон по клику вне их
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this.id);
            }
        });
    });
}

// Навигация между вкладками
function switchTab(tabName) {
    // Убираем активный класс со всех вкладок и контента
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

    // Добавляем активный класс к выбранной вкладке и контенту
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');

    // Обновляем данные при переключении на определенные вкладки
    if (tabName === 'home') {
        updateTodayMedications();
        updateFamilyStatus();
    } else if (tabName === 'medications') {
        renderMedications();
    } else if (tabName === 'family') {
        renderFamilyMembers();
    } else if (tabName === 'profile') {
        updateProfileStats();
    }
}

// Обновление времени и приветствия
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    document.getElementById('current-time').textContent = timeString;
    updateGreeting();
}

function updateGreeting() {
    const hour = new Date().getHours();
    let greeting = 'Доброе утро!';
    let icon = 'fas fa-sun';

    if (hour >= 12 && hour < 18) {
        greeting = 'Добрый день!';
        icon = 'fas fa-sun';
    } else if (hour >= 18) {
        greeting = 'Добрый вечер!';
        icon = 'fas fa-moon';
    }

    document.getElementById('greeting').textContent = greeting;
    document.querySelector('.greeting-icon i').className = icon;
}

// Обновление статистики
function updateStats() {
    const todayMedications = getTodayMedications();
    const onlineMembers = familyMembers.filter(member => member.isOnline);
    
    document.getElementById('total-medications').textContent = todayMedications.length;
    document.getElementById('online-members').textContent = onlineMembers.length;
    document.getElementById('total-family').textContent = familyMembers.length;
}

// Получение лекарств на сегодня
function getTodayMedications() {
    const today = new Date().toDateString();
    return medications.filter(med => {
        if (!med.isActive) return false;
        if (med.lastTaken === today && med.takenToday >= med.totalToday) return false;
        return true;
    });
}

// Обновление лекарств на сегодня
function updateTodayMedications() {
    const todayMedications = getTodayMedications();
    const container = document.getElementById('today-medications');
    
    if (todayMedications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-pills"></i>
                <p>Нет лекарств на сегодня</p>
            </div>
        `;
        document.getElementById('next-medication').style.display = 'none';
        return;
    }

    container.innerHTML = todayMedications.map(med => createMedicationCard(med)).join('');
    
    // Показываем следующее лекарство
    const nextMed = getNextMedication();
    if (nextMed) {
        document.getElementById('next-medication').style.display = 'block';
        document.getElementById('next-med-name').textContent = nextMed.name;
        document.getElementById('next-med-time').textContent = getNextTime(nextMed);
    } else {
        document.getElementById('next-medication').style.display = 'none';
    }
}

// Получение следующего лекарства
function getNextMedication() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const todayMedications = getTodayMedications();
    
    let nextMed = null;
    let nextTime = Infinity;
    
    todayMedications.forEach(med => {
        med.times.forEach(time => {
            const [hours, minutes] = time.split(':').map(Number);
            const medTime = hours * 60 + minutes;
            if (medTime > currentTime && medTime < nextTime) {
                nextMed = med;
                nextTime = medTime;
            }
        });
    });
    
    return nextMed;
}

// Получение следующего времени приема
function getNextTime(medication) {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    for (const time of medication.times) {
        const [hours, minutes] = time.split(':').map(Number);
        const medTime = hours * 60 + minutes;
        if (medTime > currentTime) {
            return time;
        }
    }
    return medication.times[0];
}

// Создание карточки лекарства
function createMedicationCard(medication) {
    const progressPercentage = (medication.takenToday / medication.totalToday) * 100;
    const isCompleted = medication.takenToday >= medication.totalToday;
    
    return `
        <div class="medication-card" style="border-left-color: ${medication.color}">
            <div class="medication-header">
                <div class="medication-icon" style="background-color: ${medication.color}">
                    <i class="fas fa-pills"></i>
                </div>
                <div class="medication-info">
                    <h3>${medication.name}</h3>
                    <p>${medication.dosage}</p>
                </div>
                <button class="btn-take ${isCompleted ? 'taken' : ''}" 
                        onclick="markMedicationTaken('${medication.id}')"
                        ${isCompleted ? 'disabled' : ''}>
                    <i class="fas fa-${isCompleted ? 'check' : 'plus'}"></i>
                    ${isCompleted ? 'Принято' : 'Принять'}
                </button>
            </div>
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercentage}%; background-color: ${medication.color}"></div>
                </div>
                <div class="progress-text">${medication.takenToday}/${medication.totalToday} приемов</div>
            </div>
        </div>
    `;
}

// Отметка о принятии лекарства
function markMedicationTaken(medicationId) {
    const medication = medications.find(med => med.id === medicationId);
    if (!medication) return;

    const today = new Date().toDateString();
    const isToday = medication.lastTaken === today;
    
    medication.lastTaken = today;
    medication.takenToday = isToday ? medication.takenToday + 1 : 1;
    
    saveMedications();
    updateTodayMedications();
    updateStats();
    updateProfileStats();
    
    // Показываем уведомление
    showNotification(`Лекарство "${medication.name}" отмечено как принятое!`, 'success');
}

// Рендеринг всех лекарств
function renderMedications() {
    const container = document.getElementById('medications-grid');
    
    if (medications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-pills"></i>
                <h3>Нет лекарств</h3>
                <p>Добавьте ваше первое лекарство для отслеживания</p>
                <button class="btn btn-primary" onclick="showAddMedicationModal()">
                    Добавить лекарство
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = medications.map(med => createMedicationCard(med)).join('');
}

// Добавление лекарства
function addMedication() {
    const name = document.getElementById('med-name').value.trim();
    const dosage = document.getElementById('med-dosage').value.trim();
    const frequency = document.getElementById('med-frequency').value.trim();
    const notes = document.getElementById('med-notes').value.trim();
    
    const timeInputs = document.querySelectorAll('.time-input');
    const times = Array.from(timeInputs).map(input => input.value).filter(time => time);
    
    if (!name || !dosage || times.length === 0) {
        showNotification('Пожалуйста, заполните все обязательные поля', 'error');
        return;
    }

    const medication = {
        id: Date.now().toString(),
        name,
        dosage,
        frequency: frequency || 'По назначению врача',
        times: times.sort(),
        notes,
        color: selectedColor,
        icon: 'pills',
        isActive: true,
        takenToday: 0,
        totalToday: times.length,
        lastTaken: null
    };

    medications.push(medication);
    saveMedications();
    
    closeModal('add-medication-modal');
    showNotification('Лекарство добавлено!', 'success');
    
    // Очищаем форму
    document.getElementById('add-medication-form').reset();
    resetTimeInputs();
    
    // Обновляем интерфейс
    renderMedications();
    updateTodayMedications();
    updateStats();
    updateProfileStats();
}

// Добавление времени приема
function addTimeInput() {
    const container = document.getElementById('time-inputs');
    const timeGroup = document.createElement('div');
    timeGroup.className = 'time-input-group';
    timeGroup.innerHTML = `
        <input type="time" class="time-input" required>
        <button type="button" class="btn-remove-time" onclick="removeTimeInput(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    container.appendChild(timeGroup);
}

// Удаление времени приема
function removeTimeInput(button) {
    button.parentElement.remove();
}

// Сброс полей времени
function resetTimeInputs() {
    const container = document.getElementById('time-inputs');
    container.innerHTML = `
        <div class="time-input-group">
            <input type="time" class="time-input" required>
            <button type="button" class="btn-remove-time" onclick="removeTimeInput(this)">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
}

// Обновление статуса семьи
function updateFamilyStatus() {
    const container = document.getElementById('family-status');
    
    if (familyMembers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <p>Добавьте членов семьи</p>
            </div>
        `;
        return;
    }

    container.innerHTML = familyMembers.map(member => `
        <div class="family-member">
            <div class="member-avatar ${member.isOnline ? 'online' : 'offline'}">
                <i class="fas fa-user"></i>
            </div>
            <div class="member-name">${member.name}</div>
            <div class="member-status">
                <span class="status-indicator ${member.isOnline ? 'online' : 'offline'}"></span>
                ${member.isOnline ? 'Онлайн' : 'Офлайн'}
            </div>
        </div>
    `).join('');
}

// Рендеринг членов семьи
function renderFamilyMembers() {
    const container = document.getElementById('family-grid');
    
    if (familyMembers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>Нет членов семьи</h3>
                <p>Добавьте ваших близких для отслеживания их статуса</p>
                <button class="btn btn-primary" onclick="showAddFamilyModal()">
                    Добавить члена семьи
                </button>
            </div>
        `;
        return;
    }

    container.innerHTML = familyMembers.map(member => `
        <div class="family-member">
            <div class="member-avatar ${member.isOnline ? 'online' : 'offline'}">
                <i class="fas fa-user"></i>
            </div>
            <div class="member-name">${member.name}</div>
            <div class="member-status">
                <span class="status-indicator ${member.isOnline ? 'online' : 'offline'}"></span>
                ${member.isOnline ? 'Онлайн' : 'Офлайн'}
            </div>
            <div style="margin-top: 0.5rem; font-size: 0.8rem; color: #666;">
                ${member.relationship}
            </div>
        </div>
    `).join('');
}

// Добавление члена семьи
function addFamilyMember() {
    const name = document.getElementById('family-name').value.trim();
    const relationship = document.getElementById('family-relationship').value;
    const phone = document.getElementById('family-phone').value.trim();
    const email = document.getElementById('family-email').value.trim();
    
    if (!name || !relationship) {
        showNotification('Пожалуйста, заполните имя и родство', 'error');
        return;
    }

    const member = {
        id: Date.now().toString(),
        name,
        relationship,
        phone: phone || null,
        email: email || null,
        isOnline: true,
        lastSeen: new Date().toISOString(),
        notifications: true
    };

    familyMembers.push(member);
    saveFamilyMembers();
    
    closeModal('add-family-modal');
    showNotification('Член семьи добавлен!', 'success');
    
    // Очищаем форму
    document.getElementById('add-family-form').reset();
    
    // Обновляем интерфейс
    renderFamilyMembers();
    updateFamilyStatus();
    updateStats();
}

// Обновление онлайн статуса (симуляция)
function updateOnlineStatus() {
    familyMembers.forEach(member => {
        // Случайно обновляем статус для демонстрации
        if (Math.random() > 0.8) {
            member.isOnline = Math.random() > 0.5;
            member.lastSeen = new Date().toISOString();
        }
    });
    
    saveFamilyMembers();
    updateFamilyStatus();
    renderFamilyMembers();
    updateStats();
}

// Обновление статистики профиля
function updateProfileStats() {
    const totalMeds = medications.length;
    const activeMeds = medications.filter(med => med.isActive).length;
    const completedToday = medications.reduce((total, med) => total + med.takenToday, 0);
    const totalToday = medications.reduce((total, med) => total + med.totalToday, 0);
    const completionRate = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;
    
    document.getElementById('profile-total-meds').textContent = totalMeds;
    document.getElementById('profile-active-meds').textContent = activeMeds;
    document.getElementById('profile-completion').textContent = completionRate + '%';
}

// Показ модальных окон
function showAddMedicationModal() {
    document.getElementById('add-medication-modal').classList.add('show');
}

function showAddFamilyModal() {
    document.getElementById('add-family-modal').classList.add('show');
}

// Закрытие модальных окон
function closeModal(modalId) {
    document.getElementById(modalId).classList.remove('show');
}

// Сохранение данных
function saveMedications() {
    localStorage.setItem('medications', JSON.stringify(medications));
}

function saveFamilyMembers() {
    localStorage.setItem('familyMembers', JSON.stringify(familyMembers));
}

// Показ уведомлений
function showNotification(message, type = 'info') {
    // Создаем элемент уведомления
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Добавляем стили
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    // Добавляем анимацию
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
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Удаляем уведомление через 3 секунды
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}
