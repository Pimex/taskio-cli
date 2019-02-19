'use strict'

import test from 'ava'
import Client from '../src'
import fixtures from './fixtures'
import uuid from 'uuid'
import Moment from 'moment'

let cli = null

test.before(async t => {
  const whkServer = await fixtures.webhook.server()

  cli = new Client('https://taskio-eygekiaxmd.now.sh', {
    response: 'all'
  })

  t.context.webhookServer = whkServer

  t.context.taskData = fixtures.task.data(whkServer)
})

test.afterEach(async t => {
  if (t.context.task) {
    await cli.task.delete(t.context.task.data.id)
  }
})

test('Get task by id', async t => {
  const taskData = t.context.taskData

  const newTask = await cli.task.add(taskData)
  const newTaskData = await cli.task.get(newTask.data.id)

  t.context.task = newTask

  t.is(newTask.statusCode, 201)
  t.is(newTaskData.statusCode, 200)
  t.deepEqual(newTask.data.title, taskData.title)
  t.deepEqual(newTask.data.id, newTaskData.data.id)
  t.is(typeof newTask.data.id, 'string')
})

test('Get all tasks by query', async t => {
  const taskData = t.context.taskData
  const owner = `${uuid.v4()}@gmail.com`
  taskData.owner = owner

  const newTask = await cli.task.add(taskData)
  const tasks = await cli.task.getAll({
    owner
  })

  t.context.task = newTask

  t.is(newTask.statusCode, 201)
  t.is(tasks.statusCode, 200)
  t.is(tasks.data.length > 0, true)
  t.is(tasks.data.filter(i => i.owner === newTask.data.owner).length > 0, true)
})

test('add Task', async t => {
  const taskData = t.context.taskData

  const newTask = await cli.task.add(taskData)
  t.context.task = newTask

  t.is(newTask.statusCode, 201)
  t.deepEqual(newTask.data.name, taskData.name)
  t.deepEqual(newTask.data.exect_date, taskData.exect_date)
  t.is(typeof newTask.data.id, 'string')
})

test('update Task', async t => {
  const taskData = t.context.taskData
  const newTitle = uuid.v4()

  const newTask = await cli.task.add(taskData)
  t.context.task = newTask

  const updateTask = await cli.task.update(newTask.data.id, {
    title: newTitle
  })

  t.is(newTask.statusCode, 201)
  t.is(updateTask.statusCode, 201)
  t.deepEqual(newTask.data.title, taskData.title)
  t.deepEqual(newTask.data.reminder.exect_date, taskData.reminder.exect_date)
  t.is(typeof newTask.data.id, 'string')
  t.is(updateTask.data.title, newTitle)
})

test('No update task id', async t => {
  const taskData = t.context.taskData

  const newTask = await cli.task.add(taskData)
  t.context.task = newTask

  const updateTask = await cli.task.update(newTask.data.id, {
    id: uuid.v4()
  })

  t.is(newTask.statusCode, 201)
  t.is(updateTask.statusCode, 201)
  t.deepEqual(newTask.data.name, taskData.name)
  t.is(typeof newTask.data.id, 'string')
  t.is(typeof updateTask.data.id, 'undefined')
})

test('Get all tasks', async t => {
  const taskData = t.context.taskData

  const newTask = await cli.task.add(taskData)
  t.context.task = newTask

  const tasks = await cli.task.getAll()

  t.is(newTask.statusCode, 201)
  t.is(tasks.statusCode, 200)
  t.is(tasks.data.length > 0, true)
  t.is(tasks.data.filter(i => i.id === newTask.data.id).length > 0, true)
})

test('Remove task', async t => {
  const taskData = t.context.taskData

  const newTask = await cli.task.add(taskData)

  const removeTask = await cli.task.delete(newTask.data.id)

  const tasks = await cli.task.getAll()

  t.is(newTask.statusCode, 201)
  t.is(tasks.statusCode, 200)
  t.is(removeTask.statusCode, 200)
  t.is(tasks.data.filter(i => i.id === newTask.data.id).length <= 0, true)
})

test('Exec task monitor', async t => {
  const taskData = t.context.taskData
  taskData.reminder.exect_date = Moment().add(10, 'second').unix()

  const newTask = await cli.task.add(taskData)
  t.context.task = newTask

  const monitor = await cli.task.execMonitor()

  t.is(newTask.statusCode, 201)
  t.is(monitor.statusCode, 200)
  t.is(monitor.data.filter(i => i.id === newTask.data.id).length > 0, true)
})
