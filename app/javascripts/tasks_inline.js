InlineTasks = {

  toggleFold: function(task) {
    var block_id = "inline_"+task.readAttribute("id")

    if (task.hasClassName('expanded')) {
      task.removeClassName('expanded')
      new Effect.BlindUp(block_id, {duration: 0.5});
      new Effect.Fade(task.down('.expanded_actions'), {duration: 0.5})
      setTimeout(function() { $(block_id).remove() }, 500 )
    } else {
      if (!task.down('.loading_icon')) {
        task.down('span.task_status').insert({ before: "<div class='loading_icon'> </div>" })
        task.down('span.task_status').hide()
      }
      new Ajax.Request(task.down('a.name').readAttribute('href')+".frag", {
        method: "get",
        onSuccess: function(r) {
          task.down('.loading_icon').remove()
          task.down('span.task_status').show()
          var block = "<div class='task_inline' style='display:none' id='"+block_id+"'>"+r.responseText+"</div>"
          task.insert({ bottom: block })
          new Effect.BlindDown(block_id, {duration: 0.5})
          new Effect.Appear(task.down('.expanded_actions'), {duration: 0.5})
          task.addClassName('expanded')
          format_posted_date()
        },
        onFailure: function(r) {
          task.down('.loading_icon').remove()
          task.down('span.task_status').show()
        }
      })
    }
  }
  
}
// Expand/collapse task threads inline in TaskLists#index
document.on('click', '.task_list_container a.name, .task_list_container a.hide', function(e, el) {
  if (e.isMiddleClick()) return
  e.stop()

  InlineTasks.toggleFold(el.up('.task'))
})


// Update the parent task when commenting from a task thead that's been expanded inline
document.on('ajax:success', '.task_inline form', function(e, form) {
  var task = form.up('.task.expanded')
  if(!task) return

  var task_data = e.memo.headerJSON

  var status_comments = task.down('.task_status')
  status_comments.update(parseInt(status_comments.innerHTML) + 1)

  var status = task_data.status
  var status_name = $w("new open hold resolved rejected")[status]

  var person = task_data.assigned_id
  var is_assigned_to_me = (status == 1) && my_projects[person]

  // Cleanup the current status of the task
  task.className = task.className.replace(/(^|\s+)user_(.+?)(\s+|$)/, ' ').strip()
  task.className = task.className.replace(/(^|\s+)status_(.+?)(\s+|$)/, ' ').strip()
  task.down('.assigned_user') && task.down('.assigned_user').remove()

  // Mark as mine if it's assigned to me
  is_assigned_to_me ? task.addClassName('mine') : task.removeClassName('mine')

  // Update the status of the task
  task.addClassName('status_'+status_name)

  // Show new assigned user name if there's an assigned user
  if (status == 1) {
    task.addClassName('user_'+task_data.assigned.user_id)
    var short_name = task_data.assigned.user.last_name
    task.down('a.name').insert({after: " <span class='assigned_user'>"+short_name+"</span> "})
  }
  
  // Hide dates for resolved tasks
  if (status == 3 || status == 4) {
    task.down('.assigned_date') && task.down('.assigned_date').remove()
  }
})