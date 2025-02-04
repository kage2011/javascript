$('form').autosave({
    save: function (data) {
        localStorage.setItem('form_data', JSON.stringify(data));
    },
    load: function () {
        return JSON.parse(localStorage.getItem('form_data') || '{}');
    }
});
