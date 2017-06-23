defmodule Pxblog.PostView do
  use Pxblog.Web, :view

  def markdown(body) do
    body
    |> strip_unsafe_body
    |> Earmark.to_html
    |> raw
  end

  defp strip_unsafe_body(nil) do
    nil
  end

  defp strip_unsafe_body(body) do
    {:safe, clean_body} = Phoenix.HTML.html_escape(body)
    clean_body
  end
end
