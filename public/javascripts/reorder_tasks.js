function make_task_sortable(task_div_id, task_div_ids){
  Sortable.create(task_div_id, {
    constraint:'vertical',
    containment: task_div_ids,
    format: /.*task_(\d+)_item/,
    handle:'img.drag',
    // that makes the task disappear when it leaves its original task list
    // only:'task',
    tag:'div',
    onUpdate: function(){
      new Ajax.Request($(task_div_id).readAttribute("reorder_url"), {
        asynchronous: true,
        evalScripts: true,
        parameters: Sortable.serialize(task_div_id)
      })
    }
  })
}

function make_all_tasks_sortable() {
  var task_div_ids = $$(".tasks").map(function(task_div){
    return task_div.identify();
  })
  task_div_ids.each(function(task_div_id){
    make_task_sortable(task_div_id, task_div_ids);
  })
}

document.observe("dom:loaded", function(){
  make_all_tasks_sortable();
  $$(".inline_form_cancel").each(function(cancel_link){
    cancel_link.observe('click', function(event){
      var form = event.findElement("form");
      // make the Add task link appear
      form.up().down(".new_task_link").show();
      // hide the form
      form.hide();
    })
  })
  $$(".inline_form_submit").each(function(submit_button){
    submit_button.observe('click', function(event){
      var form = event.findElement("form");
      var submit_url = form.readAttribute("action");
      new Ajax.Request(submit_url, {
        asynchronous: true,
        evalScripts: true,
        parameters: form.serialize(),
        onLoading: function() {
          // show loading bubbles
          form.down('.loading').show();
        },
        onSuccess: function(response){
          form.down('.loading').hide();
          // make the form disappear
          form.hide();
          // make the Add task link appear
          form.up().down(".new_task_link").show();
          // add a new task in the task list box, to the bottom
          var task_item_html = response.responseText;
          var list_of_tasks = form.up().down(".tasks");
          list_of_tasks.insert({ bottom: task_item_html })
          var new_task = list_of_tasks.select('.task').last();
          new_task.addClassName('active_new');
          make_all_tasks_sortable();
          var show_in_main_content_url = new_task.readAttribute('show_in_main_content_url');
          // load the new task into the main content area
          new Ajax.Request(show_in_main_content_url, {
            asynchronous: true,
            evalScripts: true,
            method: 'get',
            onSuccess: function(response){
              Element.replace('content', response.responseText);
            }
          })
        }
      })
      event.stop();
    })
  })
});