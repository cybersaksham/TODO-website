// Function to show todos
function showTodos(){
    $('#nothing').show();
    $('#todos').hide();
    $('#todos').empty();

    // Sending request to fetch todos
    $.ajax({
        url: '/fetch_todos',
        type: 'POST',
        success: function(response){
            if(response["error"] == null){
                $.each(response["data"], function(index, value){
                    $title__ = "<h5 class=\"card-header\">" + value["title"] + "</h5>"
                    $content__ = "<p class=\"card-text\">" + value["content"] + "</p>"
                    $editButton__ = "<button id=\"edit_" + value["id"] + "\" class=\"btn btn-warning\"><i class=\"bi bi-pencil-fill\"></i></button>"
                    $dltButton__ = "<button id=\"dlt_" + value["id"] + "\" class=\"btn btn-danger\"><i class=\"bi bi-trash-fill\"></i></button>"
                    $button__ = "<div class=\"btn-group\" role=\"group\">" + $editButton__ + $dltButton__ + "</div>"
                    $cardBody__ = "<div class=\"card-body\">" + $content__ + $button__ + "</div>"
                    $cardFoot__ = "<div class=\"card-footer\">" + value["time"] + "</div>"
                    $card__ = "<div class=\"todoCard card my-4 mx-2\" style=\"width: 100%;\">" + $title__ + $cardBody__ + $cardFoot__ + "</div>"
                    $('#todos').append($card__);
                });
                $('#nothing').hide();
                $('#todos').show();
            }
        }
    });
}

// Function to show errors
function showError($id, $msg){
    $($id).empty();
    $($id).append($msg);
}

// Starting Point
$(document).ready(function(){
    // Initializations
    showTodos();

    // Clicking add button
    $('#addBtn').click(function(e){
        e.preventDefault();
        if($('#title').val().length < 5 || $('#title').val().length > 20){
            showError('#errorText', "Title must be between 5 & 20 characters.");
        }
        else if($('#todo').val().length < 10 || $('#todo').val().length > 50){
            showError('#errorText', "Todo must be between 10 & 50 characters.");
        }
        else{
            showError('#errorText', "");
            // Sending request to add todos
            $.ajax({
                url: '/add_todo',
                type: 'POST',
                data: $('#addForm').serialize(),
                success: function(response){
                    $(location).attr('href', '/');
                }
            });
        }
    });

    $.ajax({
        url: '/fetch_todos',
        type: 'POST',
        success: function(response){
            if(response["error"] == null){
                $.each(response["data"], function(index, value){
                    // Clicking delete button
                    $('#dlt_' + value["id"]).click(function(e){
                        e.preventDefault();
                        $.ajax({
                            url: '/delete_todo?id=' + value["id"],
                            type: 'POST',
                            success: function(response){
                                if(response["error"] == null){
                                    showTodos();
                                }
                            }
                        });
                    });
                    // Clicking edit button
                    $('#edit_' + value["id"]).click(function(e){
                        e.preventDefault();
                        $('#title').val(value["title"]);
                        $('#todo').val(value["content"]);
                        $('#addBtn').text("Save");
                        $.ajax({
                            url: '/save_edit?id=' + value["id"],
                            type: 'POST',
                        });
                    });
                });
                // Searching todos
                $todos__ = $('.todoCard').toArray();
                $('#searchTxt').on('input', function(){
                    $count__ = 0;
                    $searchTxt = $('#searchTxt').val().toLowerCase();
                    $.each($todos__, function(index, value){
                        $todoTitle__ = $(value).find('.card-header').text().toLowerCase();
                        $todoContent__ = $(value).find('.card-text').text().toLowerCase();
                        if($todoTitle__.includes($searchTxt) || $todoContent__.includes($searchTxt)){
                            $(value).show();
                            $count__++;
                        }
                        else{
                            $(value).hide();
                        }
                    });
                    if($count__ == 0){
                        $('#nothing').show();
                    }
                    else{
                        $('#nothing').hide();
                    }
                });
            }
        }
    });

    // Clicking delete all button
    $('#dltAll').click(function(e){
        e.preventDefault();
        // Sending request to delete all todos
        $.ajax({
            url: '/dlt_all',
            type: 'POST',
            success: function(response){
                showTodos();
            }
        });
    });
});