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
                    $button__ = "<button id=\"dlt_" + value["id"] + "\" class=\"btn btn-primary\">Delete</button>"
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

    // Clicking delete button
    $.ajax({
        url: '/fetch_todos',
        type: 'POST',
        success: function(response){
            if(response["error"] == null){
                $.each(response["data"], function(index, value){
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