defmodule Pxblog.PostViewTest do
  use Pxblog.ConnCase, async: true

  test "converts markdown to html" do
    {:safe, result} = Pxblog.PostView.markdown("**bold me**")
    assert String.contains? result, "<strong>bold me</strong>"
  end

  test "leaves text with no markdown alone" do
    {:safe, result} = Pxblog.PostView.markdown("leave me alone")
    assert String.contains? result, "leave me alone"
  end

  test "strips script tags from body" do
    {:safe, result} = Pxblog.PostView.markdown("Hello <script type='javascript'>alert('foo');</script>")
    refute String.match? result, ~r{<script}
  end

  test "strips iframe tags from body" do
    {:safe, result} = Pxblog.PostView.markdown("Hello <iframe src='http://google.com'></iframe>")
    refute String.match? result, ~r{<iframe}
  end

end
