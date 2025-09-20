// Глобальные переменные
let medications = JSON.parse(localStorage.getItem('medications')) || [];
let familyMembers = JSON.parse(localStorage.getItem('familyMembers')) || [];
let selectedColor = '#a8d8ea';

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
    updateUpcomingReminders();
    setupReminderNotifications();
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
        updateUpcomingReminders();
    } else if (tabName === 'medications') {
        renderMedications();
    } else if (tabName === 'family') {
        renderFamilyMembers();
    } else if (tabName === 'statistics') {
        updateStatistics();
        updateHistoryTable();
    } else if (tabName === 'tips') {
        // Советы загружаются статически
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
    
    // Добавляем в историю
    const currentTime = new Date().toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    addToHistory(medicationId, currentTime, 'taken');
    
    saveMedications();
    updateTodayMedications();
    updateStats();
    updateProfileStats();
    
    // Показываем уведомление
    showNotification(`Лекарство "${medication.name}" отмечено как принятое!`, 'success');
}

// Рендеринг всех лекарств
function renderMedications() {
    filterMedications();
}

// Фильтрация и сортировка лекарств
function filterMedications() {
    const container = document.getElementById('medications-grid');
    const searchTerm = document.getElementById('medication-search')?.value.toLowerCase() || '';
    const filterValue = document.getElementById('medication-filter')?.value || 'all';
    const sortValue = document.getElementById('medication-sort')?.value || 'name';
    
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

    let filteredMedications = medications.filter(med => {
        // Поиск по названию
        const matchesSearch = med.name.toLowerCase().includes(searchTerm);
        
        // Фильтрация по статусу
        let matchesFilter = true;
        switch (filterValue) {
            case 'active':
                matchesFilter = med.isActive;
                break;
            case 'completed':
                matchesFilter = !med.isActive || med.takenToday >= med.totalToday;
                break;
            case 'today':
                matchesFilter = getTodayMedications().some(todayMed => todayMed.id === med.id);
                break;
        }
        
        return matchesSearch && matchesFilter;
    });

    // Сортировка
    filteredMedications.sort((a, b) => {
        switch (sortValue) {
            case 'name':
                return a.name.localeCompare(b.name);
            case 'time':
                const aTime = a.times[0] || '23:59';
                const bTime = b.times[0] || '23:59';
                return aTime.localeCompare(bTime);
            case 'progress':
                const aProgress = a.totalToday > 0 ? (a.takenToday / a.totalToday) : 0;
                const bProgress = b.totalToday > 0 ? (b.takenToday / b.totalToday) : 0;
                return bProgress - aProgress;
            default:
                return 0;
        }
    });

    if (filteredMedications.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <h3>Лекарства не найдены</h3>
                <p>Попробуйте изменить параметры поиска или фильтрации</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filteredMedications.map(med => createMedicationCard(med)).join('');
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

// ==================== СТАТИСТИКА ====================

// Глобальные переменные для статистики
let medicationHistory = JSON.parse(localStorage.getItem('medicationHistory')) || [];

// Обновление статистики
function updateStatistics() {
    const period = document.getElementById('statistics-period').value;
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
        case 'week':
            startDate.setDate(endDate.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
        case '3months':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
    }
    
    const stats = calculateStatistics(startDate, endDate);
    
    document.getElementById('stats-compliance').textContent = stats.compliance + '%';
    document.getElementById('stats-taken').textContent = stats.taken;
    document.getElementById('stats-missed').textContent = stats.missed;
    document.getElementById('stats-streak').textContent = stats.streak;
    
    updateChart(stats);
}

// Расчет статистики
function calculateStatistics(startDate, endDate) {
    let totalDoses = 0;
    let takenDoses = 0;
    let missedDoses = 0;
    let currentStreak = 0;
    let maxStreak = 0;
    
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
        const dateString = currentDate.toDateString();
        const dayDoses = getDayDoses(dateString);
        
        if (dayDoses.total > 0) {
            totalDoses += dayDoses.total;
            takenDoses += dayDoses.taken;
            missedDoses += dayDoses.missed;
            
            if (dayDoses.taken === dayDoses.total) {
                currentStreak++;
                maxStreak = Math.max(maxStreak, currentStreak);
            } else {
                currentStreak = 0;
            }
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    const compliance = totalDoses > 0 ? Math.round((takenDoses / totalDoses) * 100) : 0;
    
    return {
        compliance,
        taken: takenDoses,
        missed: missedDoses,
        streak: maxStreak,
        total: totalDoses
    };
}

// Получение доз за день
function getDayDoses(dateString) {
    const dayHistory = medicationHistory.filter(entry => entry.date === dateString);
    const total = dayHistory.length;
    const taken = dayHistory.filter(entry => entry.status === 'taken').length;
    const missed = total - taken;
    
    return { total, taken, missed };
}

// Обновление графика
function updateChart(stats) {
    const canvas = document.getElementById('medicationChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Очищаем canvas
    ctx.clearRect(0, 0, width, height);
    
    // Рисуем простой график
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 3;
    
    // Фон круга
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.fillStyle = '#f0f0f0';
    ctx.fill();
    
    // Дугa для соблюдения режима
    const complianceAngle = (stats.compliance / 100) * 2 * Math.PI;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, -Math.PI / 2, -Math.PI / 2 + complianceAngle);
    ctx.lineWidth = 20;
    ctx.strokeStyle = '#98d8c8';
    ctx.stroke();
    
    // Текст в центре
    ctx.fillStyle = '#2d3748';
    ctx.font = 'bold 24px Inter';
    ctx.textAlign = 'center';
    ctx.fillText(stats.compliance + '%', centerX, centerY - 10);
    ctx.font = '16px Inter';
    ctx.fillText('Соблюдение', centerX, centerY + 15);
}

// Обновление таблицы истории
function updateHistoryTable() {
    const fromDate = document.getElementById('history-date-from').value;
    const toDate = document.getElementById('history-date-to').value;
    
    // Устанавливаем значения по умолчанию
    if (!fromDate || !toDate) {
        const today = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(today.getDate() - 7);
        
        document.getElementById('history-date-from').value = weekAgo.toISOString().split('T')[0];
        document.getElementById('history-date-to').value = today.toISOString().split('T')[0];
    }
    
    const startDate = new Date(document.getElementById('history-date-from').value);
    const endDate = new Date(document.getElementById('history-date-to').value);
    
    const filteredHistory = medicationHistory.filter(entry => {
        const entryDate = new Date(entry.date);
        return entryDate >= startDate && entryDate <= endDate;
    }).sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
    
    const tbody = document.querySelector('#history-table tbody');
    tbody.innerHTML = '';
    
    if (filteredHistory.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: #666;">Нет данных за выбранный период</td></tr>';
        return;
    }
    
    filteredHistory.forEach(entry => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${formatDate(entry.date)}</td>
            <td>${entry.medicationName}</td>
            <td>${entry.time}</td>
            <td class="${entry.status === 'taken' ? 'status-taken' : 'status-missed'}">
                <i class="fas fa-${entry.status === 'taken' ? 'check' : 'times'}"></i>
                ${entry.status === 'taken' ? 'Принято' : 'Пропущено'}
            </td>
        `;
        tbody.appendChild(row);
    });
}

// Форматирование даты
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

// Экспорт статистики
function exportStatistics() {
    const period = document.getElementById('statistics-period').value;
    const endDate = new Date();
    let startDate = new Date();
    
    switch (period) {
        case 'week':
            startDate.setDate(endDate.getDate() - 7);
            break;
        case 'month':
            startDate.setMonth(endDate.getMonth() - 1);
            break;
        case '3months':
            startDate.setMonth(endDate.getMonth() - 3);
            break;
    }
    
    const stats = calculateStatistics(startDate, endDate);
    
    // Создаем CSV контент
    let csvContent = 'Дата,Лекарство,Время,Статус\n';
    
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
        const dateString = currentDate.toDateString();
        const dayHistory = medicationHistory.filter(entry => entry.date === dateString);
        
        if (dayHistory.length === 0) {
            csvContent += `${formatDate(dateString)},Нет данных,,\n`;
        } else {
            dayHistory.forEach(entry => {
                csvContent += `${formatDate(dateString)},${entry.medicationName},${entry.time},${entry.status === 'taken' ? 'Принято' : 'Пропущено'}\n`;
            });
        }
        
        currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Добавляем статистику
    csvContent += `\nСтатистика за период ${period}\n`;
    csvContent += `Соблюдение режима,${stats.compliance}%\n`;
    csvContent += `Принято доз,${stats.taken}\n`;
    csvContent += `Пропущено доз,${stats.missed}\n`;
    csvContent += `Максимальная серия,${stats.streak} дней\n`;
    
    // Скачиваем файл
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `medtracker_statistics_${period}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showNotification('Статистика экспортирована!', 'success');
}

// Добавление записи в историю
function addToHistory(medicationId, time, status) {
    const medication = medications.find(med => med.id === medicationId);
    if (!medication) return;
    
    const entry = {
        id: Date.now().toString(),
        medicationId,
        medicationName: medication.name,
        time,
        date: new Date().toDateString(),
        status, // 'taken' или 'missed'
        timestamp: new Date().toISOString()
    };
    
    medicationHistory.push(entry);
    localStorage.setItem('medicationHistory', JSON.stringify(medicationHistory));
}

// ==================== СИСТЕМА НАПОМИНАНИЙ ====================

// Обновление предстоящих напоминаний
function updateUpcomingReminders() {
    const container = document.getElementById('upcoming-reminders');
    if (!container) return;
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const upcomingReminders = [];
    
    // Находим напоминания на ближайшие 4 часа
    medications.forEach(medication => {
        if (!medication.isActive) return;
        
        medication.times.forEach(time => {
            const [hours, minutes] = time.split(':').map(Number);
            const medTime = hours * 60 + minutes;
            const timeDiff = medTime - currentTime;
            
            // Если напоминание в ближайшие 4 часа
            if (timeDiff > 0 && timeDiff <= 240) {
                const reminderTime = new Date();
                reminderTime.setHours(hours, minutes, 0, 0);
                
                upcomingReminders.push({
                    medication,
                    time: time,
                    timeString: reminderTime.toLocaleTimeString('ru-RU', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                    }),
                    minutesUntil: Math.floor(timeDiff)
                });
            }
        });
    });
    
    // Сортируем по времени
    upcomingReminders.sort((a, b) => a.minutesUntil - b.minutesUntil);
    
    if (upcomingReminders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bell"></i>
                <p>Нет напоминаний на ближайшее время</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = upcomingReminders.slice(0, 3).map(reminder => `
        <div class="reminder-card ${reminder.minutesUntil <= 30 ? 'upcoming' : ''}">
            <div class="reminder-time">
                <i class="fas fa-clock"></i>
                ${reminder.timeString}
                <span style="font-size: 0.8em; color: #666; margin-left: 0.5rem;">
                    (через ${reminder.minutesUntil} мин)
                </span>
            </div>
            <div class="reminder-medication">
                <i class="fas fa-pills" style="color: ${reminder.medication.color};"></i>
                ${reminder.medication.name} - ${reminder.medication.dosage}
            </div>
        </div>
    `).join('');
}

// Настройка уведомлений
function setupReminderNotifications() {
    // Проверяем поддержку уведомлений
    if (!('Notification' in window)) {
        console.log('Уведомления не поддерживаются в этом браузере');
        return;
    }
    
    // Запрашиваем разрешение
    if (Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Разрешение на уведомления получено');
            }
        });
    }
    
    // Проверяем напоминания каждую минуту
    setInterval(checkReminders, 60000);
}

// Проверка напоминаний
function checkReminders() {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    medications.forEach(medication => {
        if (!medication.isActive) return;
        
        medication.times.forEach(time => {
            const [hours, minutes] = time.split(':').map(Number);
            const medTime = hours * 60 + minutes;
            const timeDiff = medTime - currentTime;
            
            // Если время приема настало (с точностью до 1 минуты)
            if (timeDiff === 0 || (timeDiff > -1 && timeDiff < 1)) {
                showReminderNotification(medication, time);
            }
        });
    });
}

// Показ уведомления о напоминании
function showReminderNotification(medication, time) {
    const reminderKey = `reminder_${medication.id}_${time}_${new Date().toDateString()}`;
    
    // Проверяем, не показывали ли мы уже это напоминание сегодня
    if (localStorage.getItem(reminderKey)) {
        return;
    }
    
    // Отмечаем, что напоминание показано
    localStorage.setItem(reminderKey, 'true');
    
    // Показываем уведомление браузера
    if (Notification.permission === 'granted') {
        const notification = new Notification('Время приема лекарства!', {
            body: `${medication.name} - ${medication.dosage}`,
            icon: '/favicon.ico',
            tag: `medication_${medication.id}`,
            requireInteraction: true
        });
        
        notification.onclick = function() {
            window.focus();
            notification.close();
        };
        
        // Автоматически закрываем через 10 секунд
        setTimeout(() => {
            notification.close();
        }, 10000);
    }
    
    // Показываем уведомление в приложении
    showNotification(`Время принять ${medication.name}!`, 'success');
    
    // Воспроизводим звук (если разрешено)
    playReminderSound();
}

// Воспроизведение звука напоминания
function playReminderSound() {
    // Создаем простой звуковой сигнал
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
}
