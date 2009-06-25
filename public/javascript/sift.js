$.fn.scrollTo = function(el, speed) {
    var target,
    container
    if (typeof el == 'number' || !el) {
        speed = el
        target = this
        container = 'html,body'
    } else {
        target = el
        container = this
    }
    var offset = $(target).offset().top - 30
    $(container).animate({
        scrollTop: offset
    },
    speed || 1000)
    return this
}

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
    
    window.location.hash = "entries/" + entry
    active.find(".details").show()
    $('#back').show()
    $('#entries .select').hide()
  },
  
  backToList: function() {
    active = Sift.Entries.active
    $('#entries .entry').show()
    $("#entry_" + active).find(".details").hide()
    $('#back').hide()
    $('#entries .select').show()
    window.location.hash = ""
    Sift.Entries.active = null
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
  },
  
  rateSelected: function(rating) {
    var entries = $('#entries :checkbox[checked]').parents('.entry')
    
    var payload = $.map(entries, function(entry) { 
      id = $(entry).attr('id').split("_")[1]
      Sift.Entries.find(id).rating = rating
      
      Sift.Ratings.select($("#entry_" + id + " .summary .rating"), rating)
      return 'rating[' + id + ']=' + rating
    })
    
    $.post('/rate', payload.join("&"))
  }
}


Sift.Entries.Entry = function(id, rating, updated) {
  this.id = id
  this._rating = rating
  this.updated = updated
  Sift.Entries.list.push(this)
}

Sift.Entries.Entry.prototype = {
  get element() {
    return $("#entry_" + this.id)
  },
  
  set rating(rating) {
    if(rating >= 0 && rating <= 5) {
      this._rating = rating
    }
    
    return this._rating
  }
}

Sift.Ratings = {
  select: function(elem, rating) {
    $(elem).find('li.star a.active').removeClass("active")
    $(elem).find('li.star a').each(function(i, n) {
      if(i < rating)
        $(n).addClass("active")
    })
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
  
  $('#entries .meta a').click(function() {
    Sift.Entries.showEntry($(this).closest(".entry").attr("id").split("_")[1])
    return false
  })
  
  $('#back').click(Sift.Entries.backToList)
  
  $('.summary .rating a').click(function() {
    rating = parseInt(this.innerText)
    Sift.Ratings.select($(this).closest('.rating'), rating)
    
    id = $(this).closest('.entry').attr('id').split("_")[1]
    Sift.Entries.find(id).rating = rating
    $.post('/rate', 'rating[' + id + ']=' + rating)
    return false
  })
  
  $('.details .rating a').click(function () {
    rating = parseInt(this.innerText)
    elem = $(this)
    Sift.Ratings.select(elem.closest('.rating'), rating)
    
    id = elem.closest('.entry').attr('id').split("_")[1]
    feature = elem.closest('.technique').attr("id")
    $.post('/rate/' + feature + "/" + id, "rating=" + rating)
    return false
  })
  
  $('#entry').focus(function() {
    el = $(this)
    if(el.val() == "Question") {
      el.val("")
    }
  })
  
  $('#entry').blur(function() {
    el = $(this)
    if(el.val() == "") {
      el.val("Question")
    }
  })
  
  $("#show-entry-form").click(function() {
    $('#new-entry').show()
    return false
  })
  
  $("#cancel-entry-form").click(function() {
    $('#new-entry').hide()
    return false
  })
  
  $("#new-entry-form").submit(function() {
    
    $.post("/new", $(this).serialize(), function(data, status) {
      d = $(data)
      $('#entries .list').prepend(d)
      new Sift.Entries.Entry(d.attr('id').split("_")[1], null, null)
      $('#new-entry').hide()
      $('#entries .list li:first').css("background-color", "#F8FFBC")
      $('#entries .list li:first').animate({backgroundColor: "#FFFFFF" }, "medium")
    })
    return false
  })
  
  $("#actions").change(function() {
    v = $(this).val()
    if(m = v.match(/^rate-(\d)/)) {
      Sift.Entries.rateSelected(m[1])
    }
  })
  
  if(window.location.hash.match(/^#entries/)) {
    Sift.Entries.showEntry(window.location.hash.split("/")[1])
  }
  
  Sift.Entries.targetFirst()
  
  $(document).bind('keydown', 'k', Sift.Entries.targetPrev)
  $(document).bind('keydown', 'j', Sift.Entries.targetNext)
  $(document).bind('keydown', 'x', Sift.Entries.toggleSelectedTarget)
  $(document).bind('keydown', 'return', Sift.Entries.showTarget)
  $(document).bind('keydown', '1', function() { Sift.Entries.rateSelected(1) })
  $(document).bind('keydown', '2', function() { Sift.Entries.rateSelected(2) })
  $(document).bind('keydown', '3', function() { Sift.Entries.rateSelected(3) })
  $(document).bind('keydown', '4', function() { Sift.Entries.rateSelected(4) })
  $(document).bind('keydown', '5', function() { Sift.Entries.rateSelected(5) })
})

