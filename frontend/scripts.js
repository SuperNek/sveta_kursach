document.addEventListener('DOMContentLoaded', () => {
    const requestsTable = document.getElementById('requests-table');
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const requestForm = document.getElementById('request-form');
    const closeModal = document.getElementById('close-modal');
    const createRequestBtn = document.getElementById('create-request-btn');
  
    let editMode = false;
    let editId = null;
  
    // Функция для получения заявок
    const fetchRequests = async () => {
      try {
        const response = await fetch('/api/requests'); // URL для вашего backend
        const requests = await response.json();
  
        // Заполняем таблицу заявок
        requestsTable.innerHTML = requests.map(request => `
          <tr>
            <td>${request.id}</td>
            <td>${request.description}</td>
            <td>${request.status}</td>
            <td>${request.initiator}</td>
            <td>${request.executor || '-'}</td>
            <td>${request.priority}</td>
            <td>${request.dueDate || '-'}</td>
            <td>
              <button class="edit" data-id="${request.id}">Редактировать</button>
              <button class="delete" data-id="${request.id}">Удалить</button>
            </td>
          </tr>
        `).join('');
      } catch (error) {
        console.error('Ошибка при получении заявок:', error);
      }
    };
  
    // Открытие модального окна
    const showModal = (isEdit = false, data = {}) => {
      modalTitle.textContent = isEdit ? 'Редактирование заявки' : 'Создание заявки';
      editMode = isEdit;
      editId = data.id || null;
  
      if (isEdit) {
        requestForm.description.value = data.description;
        requestForm.priority.value = data.priority;
        requestForm.initiator.value = data.initiator;
        requestForm.executor.value = data.executor || '';
        requestForm.dueDate.value = data.dueDate || '';
        requestForm.comments.value = data.comments || '';
      } else {
        requestForm.reset();
      }
  
      modal.classList.remove('hidden');
    };
  
    // Закрытие модального окна
    closeModal.addEventListener('click', () => modal.classList.add('hidden'));
  
    // Создание или обновление заявки
    requestForm.addEventListener('submit', async (e) => {
      e.preventDefault();
  
      const data = {
        description: requestForm.description.value,
        priority: requestForm.priority.value,
        initiator: requestForm.initiator.value,
        executor: requestForm.executor.value,
        dueDate: requestForm.dueDate.value,
        comments: requestForm.comments.value,
      };
  
      try {
        const method = editMode ? 'PUT' : 'POST';
        const url = editMode ? `/api/requests/${editId}` : `/api/requests`;
  
        await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });
  
        modal.classList.add('hidden');
        fetchRequests();
      } catch (error) {
        console.error('Ошибка при сохранении заявки:', error);
      }
    });
  
    // Обработка кнопок редактирования и удаления
    requestsTable.addEventListener('click', async (e) => {
      if (e.target.classList.contains('edit')) {
        const id = e.target.dataset.id;
  
        try {
          const response = await fetch(`/api/requests/${id}`);
          const data = await response.json();
          showModal(true, data);
        } catch (error) {
          console.error('Ошибка при получении данных заявки:', error);
        }
      }
  
      if (e.target.classList.contains('delete')) {
        const id = e.target.dataset.id;
  
        try {
          await fetch(`/api/requests/${id}`, { method: 'DELETE' });
          fetchRequests();
        } catch (error) {
          console.error('Ошибка при удалении заявки:', error);
        }
      }
    });
  
    // Открытие модального окна для создания заявки
    createRequestBtn.addEventListener('click', () => showModal());
  
    // Первоначальная загрузка заявок
    fetchRequests();
  });
  