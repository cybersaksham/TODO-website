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
                    $('#todos').append("<div class=\"todoCard card my-2 mx-2\" style=\"width: 18rem;\"><div class=\"card-body\"><h5 class=\"card-title\">" + value["title"] + "</h5><p class=\"card-text\">" + value["content"] + "</p><button id=\"" + value["id"] + "\" class=\"btn btn-primary\">Delete</button></div></div>");
                });
            }
        }
    });
}

$(document).ready(function(){
    // Initializations
    showTodos();
});