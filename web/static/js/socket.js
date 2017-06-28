// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "web/static/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/my_app/endpoint.ex":
import {Socket} from "phoenix"
import $ from 'jquery'

const userToken = $("meta[name='channel_token']").attr("content")
let socket = new Socket("/socket", {params: {token: userToken}})

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/2" function
// in "web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, pass the token on connect as below. Or remove it
// from connect if you don't care about authentication.


const CREATED_COMMENT = "CREATED_COMMENT",
      APPROVED_COMMENT = "APPROVED_COMMENT",
      DELETED_COMMENT = "DELETED_COMMENT"

socket.connect()

const postId = $('#post-id').val()
// Now that you are connected, you can join channels with a topic:
let channel = socket.channel(`comments:${postId}`, {})
channel.join()
  .receive("ok", resp => { console.log("Joined successfully", resp) })
  .receive("error", resp => { console.log("Unable to join", resp) })

const createComment = (payload) => `
  <div id="comment-${payload.commentId}" class="comment" data-comment-id="${payload.commentId}">
    <div class="row">
      <div class="col-xs-4">
        <strong class="comment-author">${payload.author}</strong>
      </div>
      <div class="col-xs-4">
        <em>${payload.insertedAt}</em>
      </div>
      <div class="col-xs-4 text-right">
        ${ userToken ? '<button class="btn btn-xs btn-primary approve">Approve</button> <button class="btn btn-xs btn-danger delete">Delete</button>': ''}
      </div>
      <div class="row">
        <div class="Col-xs-12 comment-body">
          ${payload.body}
        </div>
      </div>
    </div>
  `

  // REQ 3: Provide the comment's author from the form
  const getCommentAuthor   = () => $("#comment_author").val()
  // REQ 4: Provide the comment's body from the form
  const getCommentBody     = () => $("#comment_body").val()
  // REQ 5: Based on something being clicked, find the parent comment id
  const getTargetCommentId = (target) => $(target).parents(".comment").data("comment-id")
  // REQ 6: Reset the input fields to blank
  const resetFields = () => {
    $("#comment_author").val("")
    $("#comment_body").val("")
  }

$('.create-comment').on('click', (event) => {
  event.preventDefault()
  channel.push(CREATED_COMMENT, {
    author: getCommentAuthor(),
    body: getCommentBody(),
    postId
  })
  resetFields()
})


// REQ 8: Push the APPROVED_COMMENT event to the socket with the appropriate author/body/comment id
$(".comments").on("click", ".approve", (event) => {
  event.preventDefault()
  const commentId = getTargetCommentId(event.currentTarget)
  // Pull the approved comment author
  const author = $(`#comment-${commentId} .comment-author`).text().trim()
  // Pull the approved comment body
  const body = $(`#comment-${commentId} .comment-body`).text().trim()
  channel.push(APPROVED_COMMENT, { author, body, commentId, postId })
})


// REQ 9: Push the DELETED_COMMENT event to the socket but only pass the comment id (that's all we need)
$(".comments").on("click", ".delete", (event) => {
  event.preventDefault()
  const commentId = getTargetCommentId(event.currentTarget)
  channel.push(DELETED_COMMENT, { commentId, postId })
})

// REQ 10: Handle receiving the CREATED_COMMENT event
channel.on(CREATED_COMMENT, (payload) => {
  // Don't append the comment if it hasn't been approved
  if (!userToken && !payload.approved) { return; }
  // Add it to the DOM using our handy template function
  $(".comments h2").after(
    createComment(payload)
  )
})

// REQ 11: Handle receiving the APPROVED_COMMENT event
channel.on(APPROVED_COMMENT, (payload) => {
  // If we don't already have the right comment, then add it to the DOM
  if ($(`#comment-${payload.commentId}`).length === 0) {
    $(".comments h2").after(
      createComment(payload)
    )
  }
  // And then remove the "Approve" button since we know it has been approved
  $(`#comment-${payload.commentId} .approve`).remove()
})

// REQ 12: Handle receiving the DELETED_COMMENT event
channel.on(DELETED_COMMENT, (payload) => {
  // Just delete the comment from the DOM
  $(`#comment-${payload.commentId}`).remove()
})

export default socket
