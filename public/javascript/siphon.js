Siphon = {
}

Siphon.Entries = {
  active: null,
  list: [],
  
  get target() {
    return $('.target')
  },
  
  targetFirst: function() {
    Siphon.Entries.targetNone()
    $('.entry:first').addClass("target")
  },
  
  targetNone: function() {
    Siphon.Entries.target.removeClass("target")
  },
  
  toggleSelectedTarget: function() {
    var checkbox = Siphon.Entries.target.find(":checkbox")
    checkbox.attr("checked", !checkbox.attr("checked")).change()
  },
  
  targetNext: function() {
    var next = Siphon.Entries.target.next()
    Siphon.Entries.targetNone()
    
    if(next.length > 0)
      next.addClass("target")
    else
      Siphon.Entries.targetFirst()
  },
  
  targetPrev: function() {
    var prev = Siphon.Entries.target.prev()
    Siphon.Entries.targetNone()
    
    if(prev.length > 0)
      prev.addClass("target")
    else
      $('.entry:last').addClass("target")
  },
  
  showEntry: function(entry) {
    Siphon.Entries.active = entry
    
    $('#entries .entry').each(function() {
        var current = $(this)
        if (current.attr('id') == 'entry_' + entry) {
            current.addClass("active")
            current.show()
            active = current
        } else {
            current.hide()
        }
    })
    
    active.find(".details").removeClass("hidden")
    $('#back').removeClass("hidden")
    $('#entries .select').addClass("hidden")
  },
  
  showTarget: function() {
    Siphon.Entries.showEntry(Siphon.Entries.target.attr("id").split("_")[1])
  },
  
  find: function(entryId) {
    var entry = $.grep(Siphon.Entries.list,
        function(entry) {
          return entry.id == entryId
        })
    return entry[0]
  }
}


Siphon.Entries.Entry = function(id, rating, updated) {
  this.id = id
  this.rating = rating
  this.updated = updated
  Siphon.Entries.list.push(this)
}

Siphon.Entries.Entry.prototype = {
  get element() {
    return $("#entry_" + this.id)
  }
}

$(document).ready(function() {
  $('#entries :checkbox').change(function() {
    if ($(this).attr('checked'))
      $(this).parents('.entry').addClass('selected')
    else
      $(this).parents('.entry').removeClass('selected')
  })
  
  $('#select_all').click(function() {
    $('#entries :checkbox').attr('checked', 'checked').change()
    return false
  })
  
  $('#select_none').click(function() {
    $('#entries :checkbox').removeAttr('checked').change()
    return false
  })
  
  Siphon.Entries.targetFirst()
  
  $(document).bind('keydown', 'j', Siphon.Entries.targetPrev)
  $(document).bind('keydown', 'k', Siphon.Entries.targetNext)
  $(document).bind('keydown', 'x', Siphon.Entries.toggleSelectedTarget)
  $(document).bind('keydown', 'return', Siphon.Entries.showTarget)
})

