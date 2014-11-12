
function postNewStatus(author)
{
    var body = $("#body").val();
    
    if (body.length > 200)
    {
        alert("Kirjoitettu kuuluminen on liian pitkä \n Kuulumisissa on 200 merkin pituusrajoitus.");
        return;
    }
    else if (body.length == 0)
    {
        alert("Ei voi lähettää tyhjää kuulumista");
        return;
    }
    
    console.log("sending status");
    
    $.post( "/users/"+author, { body: body }, function(data) {
    
        var response = jQuery.parseJSON(data);
        
        $("#body").val('');
        
        if (response.addStatusSuccess == 1)
        {
            console.log("sent status");
            addStatusToList(response.status, true);
            addCommentBoxToStatus(response.status);
        }
        else
        {
            alert( "sending comment failed" + response.err);
        }
    });
}

function commentOnStatus(originalPoster, status, commentSource, commentList)
{
    var commentBody = $("#"+commentSource).val();
    
    if (commentBody === undefined)
        return;
    
    if (commentBody.length > 200)
    {
        alert("Kirjoitettu kommentti on liian pitkä. \n Kommenteissa on 200 merkin pituusrajoitus.");
        return;
    }
    
    if (commentBody.length == 0)
    {
        alert("Kuulumista ei voi kommentoida tyhjällä kommentilla.");
        return;
    }
    
    $.post( "/users/"+originalPoster+"/"+status+"/", { body: commentBody }, function(data) {
    
        var response = jQuery.parseJSON(data);
        
        if (response.addCommentToStatusSuccess == 1)
        {
            console.log("sent comment");
            
            $("#"+commentSource).val('');
            
            addCommentToStatus(commentList, response.comment);
        }
        else
        {
            $("#"+commentSource).val('');
            alert( response.err );
        }
    });
}

function addStatusToList(status, spaceForCommentBox)
{
    $('#statusList')
        .prepend($('<div>')
            .attr('id', 'status_'+status.id)
            .append($('<div>')
                .addClass('panel panel-info')
                .addClass(spaceForCommentBox ? 'kamula-status' : 'kamula-status-public')
                .append(
                    $('<div>')
                        .addClass('panel-heading')
                        .append(
                            $('<p>')
                                .addClass('blog-post-meta')
                                .text(status.date+', ')
                                .append(
                                    $('<a>')
                                        .attr('href', '/users/'+status.author)
                                        .text(status.author)
                                )
                        )
                )
                .append(
                    $('<div>')
                        .addClass('panel-body')
                        .append(
                            $('<p>')
                                .text(status.body)
                        )
                )
                .append(
                    $('<ul>')
                        .addClass('list-group')
                        .attr('id', 'commentList_'+status.id)
                )
            )
        );
}

function addCommentToStatus(commentList, newComment)
{
    $('#'+commentList)
        .append(
            $('<li>')
                .addClass('list-group-item')
                .append(
                    $('<div>')
                        .append(
                            $('<span>')
                                .text(newComment.body)
                        )
                        .append(
                            $('<p>')
                                .text(newComment.date+', ')
                                .append(
                                    $('<a>')
                                        .text(newComment.author)
                                        .attr('href', '/users/'+newComment.author)
                                )
                        )
                )
        );
}

function addCommentBoxToStatus(status)
{
    $('#status_'+status.id)
        .append(
            $('<div>')
                .addClass('row')
                .css('margin-bottom', '20px')
                .append(
                    $('<div>')
                        .addClass('col-lg-12')
                        .append(
                            $('<div>')
                                .addClass('input-group')
                                .append(
                                    $('<input>')
                                        .addClass('form-control')
                                        .attr('id', 'commentSource_'+status.id)
                                        .attr('type', 'text')
                                        .css('border-top-left-radius', '0px')
                                )
                                .append(
                                    $('<span>')
                                        .addClass('input-group-btn')
                                        .append(
                                            $('<button>')
                                                .addClass('btn btn-default')
                                                .attr('type', 'button')
                                                .css('border-top-right-radius', '0px')
                                                .text('Kommentoi')
                                                .bind('click', function() {
                                                    commentOnStatus(status.author, status.id, 'commentSource_'+status.id, 'commentList_'+status.id)
                                                })
                                        )
                                )
                        )
                )
        );
}

function getRecentStatusMessages()
{
    $.get( "/recent", function(data) {
    
        var response = data;
        
        $("#statusList").empty();

        for(var status = response.statusMessages.length - 1 ; status >= 0; status--)
        {
            addStatusToList(response.statusMessages[status], false);
            
            if (response.statusMessages[status].comments != undefined)
            {
                for(var comment = 0; comment < response.statusMessages[status].comments.length; comment++)
                {
                    addCommentToStatus('commentList_'+response.statusMessages[status].id, response.statusMessages[status].comments[comment]);
                }
            }
        }
        
        setRecentStatusMessagesTimeout(5000);
    });
}

function setRecentStatusMessagesTimeout(interval)
{
    setTimeout(function(){getRecentStatusMessages()}, interval);
}
