Sift = {
}

Sift.Entries = {
  active: null,
  list: [],
  
  get target() {
    return $('.target')
  },
  
  targetFirst: function() {
    Sift.Entries.targetNone()
    $('.entry:first').addClass("target")
  },
  
  targetNone: function() {
    Sift.Entries.target.removeClass("target")
  },
  
  toggleSelectedTarget: function() {
    var checkbox = Sift.Entries.target.find(":checkbox")
    checkbox.attr("checked", !checkbox.attr("checked")).change()
  },
  
  targetNext: function() {
    var next = Sift.Entries.target.next()
    Sift.Entries.targetNone()
    
    if(next.length > 0)
      next.addClass("target")
    else
      Sift.Entries.targetFirst()
      
    Sift.Entries.adjustViewForTarget()
  },
  
  targetPrev: function() {
    var prev = Sift.Entries.target.prev()
    Sift.Entries.targetNone()
    
    if(prev.length > 0)
      prev.addClass("target")
    else
      $('.entry:last').addClass("target")
    
    Sift.Entries.adjustViewForTarget()
    
  },
  
  showEntry: function(entry) {
    Sift.Entries.active = entry
    
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
  
  adjustViewForTarget: function() {
      var elem = Sift.Entries.target
      if (!elem.offset()) return
      if (elem.offset().top - $(window).scrollTop() + 20 > $(window).height()) {
          elem.scrollTo(10)
      } else if (elem.offset().top - $(window).scrollTop() < 0) {
          $('html,body').animate({
              scrollTop: elem.offset().top - $(window).height()
          },
          10);
      }
  },
  
  showTarget: function() {
    Sift.Entries.showEntry(Sift.Entries.target.attr("id").split("_")[1])
  },
  
  find: function(entryId) {
    var entry = $.grep(Sift.Entries.list,
        function(entry) {
          return entry.id == entryId
        })
    return entry[0]
  }
}


Sift.Entries.Entry = function(id, rating, updated) {
  this.id = id
  this.rating = rating
  this.updated = updated
  Sift.Entries.list.push(this)
}

Sift.Entries.Entry.prototype = {
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
  
  Sift.Entries.targetFirst()
  
  $(document).bind('keydown', 'j', Sift.Entries.targetPrev)
  $(document).bind('keydown', 'k', Sift.Entries.targetNext)
  $(document).bind('keydown', 'x', Sift.Entries.toggleSelectedTarget)
  $(document).bind('keydown', 'return', Sift.Entries.showTarget)
})

