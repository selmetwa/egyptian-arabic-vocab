import { serve } from "@hono/node-server";
import fs from "fs";
import { Hono } from "hono";
import path from "path";
import { css, Style } from "hono/css";
import { sections } from "./constants/sections";
const app = new Hono();

app.get("/", (c) => {
  const wrapper = css`
    max-width: 1200px;
    padding: 20px 20px;
    margin: 0 20px;
    display: flex;
    flex-direction: column;
    border: 4px solid #000;
    box-shadow: 10px 10px 0 rgba(0, 0, 0, 1);
    font-family: Arial, sans-serif;
  `

  const footer = css`
    background-color: #f5f5f5;
    margin-top: 12px;
    border-top: 2px solid #000;
    text-align: center;
    padding: 10px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    p {
      margin: 0;
    }
  `
  return c.html(
    <html>
      <head>
        <Style />
      </head>
      <body>
        <main class={wrapper}>
          <h1>Egyptian Arabic Vocabulary API</h1>
          <a href="https://arabic.desert-sky.net/vocab.html" target="_blank">Words scraped from Desert Sky</a>
          <section>
            <h2>Sections</h2>
            <p>Sections include both Egyptian and Standard arabic, as well as the respective transliteration</p>
            <ul>
              {sections.map((section) => (
                <li>
                  <a href={`/vocab/${section}`}>{section}</a>
                </li>
              ))}
            </ul>
          </section>
          <section>
            <h2>API</h2>
            <p>Use the following endpoint to get the vocabulary for a section</p>
            <pre>
              <code>
                GET /vocab/:section
              </code>
            </pre>
            <p>Replace <code>:section</code> with the section name (<code>/vocab/animals</code>)</p>
          </section>
          <footer class={footer}>
            <p>
              Made by <a href="https://github.com/selmetwa" target="_blank">Sherif Elmetwally</a>
            </p>
            <a href="https://github.com/selmetwa/egyptian-arabic-vocab" target="_blank">Source Code</a>
          </footer>
        </main>
      </body>
    </html>
  )
});

app.get("/vocab/:section", async (c) => {
  const section = c.req.param("section");

  const filePath = path.join("json", `${section}.json`);

  try {
    const data = await fs.promises.readFile(filePath, "utf8");
    const jsonData = JSON.parse(data);

    return c.json(jsonData);
  } catch (error: any) {
    if (error.code === "ENOENT") {
      return c.text("File not found");
    } else {
      console.error("Error reading/parsing file:", error);
      return c.text("Error reading/parsing file");
    }
  }
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
