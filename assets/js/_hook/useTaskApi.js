import {useContext} from 'react';

import {useApiClient} from './useApiClient';
import {DoneTaskContext} from '../_context/DoneTaskContext';
import {PendingTaskContext} from '../_context/PendingTaskContext';

export const useTaskApi = () => {
  const {client} = useApiClient();

  const [, setDoneTasks] = useContext(DoneTaskContext);
  const [, setPendingTasks] = useContext(PendingTaskContext);

  const getTasks = (type, date) => client.get('/api/task/' + type + (date ? '?date=' + date : '')).catch(console.log);

  const getExportTask = (date) =>
    client
      .get('/api/task/export?date=' + date)
      .then((res) => {
        const hiddenElement = document.createElement('a');
        hiddenElement.href = 'data:text/csv;charset=utf-8,' + escape(res.data);
        hiddenElement.target = '_blank';
        hiddenElement.download = date + '.csv';
        hiddenElement.click();
      })
      .catch(console.log);

  const deleteTask = (task) => client.delete('/api/task/delete/' + task.id);

  const updateTask = (task) =>
    client.patch('/api/task/' + task.id, {
      description: task.description,
      start: task.start,
      end: task.end,
      date: task.date,
    });

  const addTask = (data) =>
    client.post('/api/task/add', {
      description: data.description,
      start: data.start,
      end: data.end,
      date: data.date,
    });

  const getTasksForDate = (date) => Promise.all([getTasks('pending', null), getTasks('done', date)]);

  const getTasksForDateAndSave = (date) =>
    getTasksForDate(date).then(([pending, done]) => {
      setPendingTasks(pending.data);
      setDoneTasks(done.data);
    });

  const getTasksForSearch = ({search, page, elements}) =>
    client.get('/api/task/search', {
      params: {
        s: search,
        page: page || 1,
        elements: elements || 20,
      },
    });

  return {
    getTasks,
    deleteTask,
    updateTask,
    addTask,
    getTasksForDate,
    getTasksForDateAndSave,
    getExportTask,
    getTasksForSearch,
  };
};
