// Заглушка для старых вызовов ассистента
window.openAssistant = function() {
    // Перенаправляем на новый чат с Бо
    if (window.openSocial) {
        window.openSocial();
    } else {
        alert('Ассистент временно недоступен');
    }
};

window.openAssistantWithText = function(text) {
    // Если нужно передать текст в чат, можно сделать это здесь
    if (window.openSocial) {
        window.openSocial();
        // Можно добавить логику отправки текста в чат
    } else {
        alert('Ассистент временно недоступен');
    }
};
