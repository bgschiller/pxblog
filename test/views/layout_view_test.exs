defmodule Pxblog.LayoutViewTest do
  use Pxblog.ConnCase, async: true

  alias Pxblog.LayoutView

  import Pxblog.Factory

  setup do
    role = insert(:role)
    user = insert(:user, role: role)
    {:ok, conn: build_conn(), user: user}
  end

  test "current_user returns the user in the session", %{conn: conn, user: user} do
    conn = post conn, session_path(conn, :create), user: %{username: user.username, password: user.password}
    assert LayoutView.current_user(conn)
  end

  test "current_user returns nothing if there is no user in the session", %{conn: conn, user: user} do
    conn = delete conn, session_path(conn, :delete, user)
    refute LayoutView.current_user(conn)
  end
end
