import { serve } from "@hono/node-server";
import fs from "fs";
import { Hono } from "hono";
import path from "path";
import { css, Style } from "hono/css";
import { sections } from "./constants/sections";
import { cors } from 'hono/cors'

const app = new Hono();
app.use('/', cors())
app.use('/vocab/:section', cors())

app.get("/", (c) => {

  const totalCount = sections.reduce((acc, section) => {
    const filePath = path.join("json", `${section}.json`);
    try {
      const data = fs.readFileSync(filePath, "utf8");
      const jsonData = JSON.parse(data);
      return acc + jsonData.length;
    } catch (error: any) {
      if (error.code === "ENOENT") {
        return acc; // If file not found, don't increment count
      } else {
        throw new Error("Error reading/parsing file:", error);
      }
    }
  }, 0);
  
  const body = css`
    margin: 0;
    padding: 20px;
    background-color: #ccc;
    p,
    h1,
    h2,
    pre,
    code {
      margin: 0;
    }
  `;

  const wrapper = css`
    max-width: 1200px;
    width: fit-content;
    padding: 10px 30px;
    display: flex;
    background-color: #fff;
    flex-direction: column;
    border: 4px solid #000;
    box-shadow: 10px 10px 0 rgba(0, 0, 0, 1);
    font-family: Arial, sans-serif;

    a {
      margin-top: 10px;
      font-size: 18px;
      color: blue;
    }
  `;
  const sectionsWrapper = css`
    display: flex;
    flex-direction: column;
    gap: 30px;
    margin-top: 20px;
  `;
  const sectionWrapper = css`
    overflow-wrap: break-word;
    a {
      color: blue;
    }
    p,
    code,
    pre,
    ul,
    samp {
      margin: 4px 0;
      font-size: 18px;
    }
  `;

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
  `;
  return c.html(
    <html>
      <head>
        <Style />
      </head>
      <body class={body}>
        <main class={wrapper}>
          <h1>Egyptian Arabic Vocabulary API</h1>
          <a href='https://arabic.desert-sky.net/vocab.html' target='_blank'>
            {totalCount} words scraped from Desert Sky
          </a>
          <div class={sectionsWrapper}>
            <section class={sectionWrapper}>
              <h2>Sections</h2>
              <p>
                Sections include both Egyptian and Standard arabic, as well as
                the respective transliteration
              </p>
              <ul>
                {sections.map((section) => (
                  <li>
                    <a href={`/vocab/${section}`}>{section}</a>
                  </li>
                ))}
              </ul>
            </section>
            <section class={sectionWrapper}>
              <h2>API</h2>
              <p>
                Use the following endpoint to get the vocabulary for a section
              </p>
              <pre>
                <code>GET /vocab/:section</code>
              </pre>
              <p>
                Replace <code>:section</code> with the section name{" "}
              </p>

              <h3>Example</h3>
              <p>
                <code>GET /vocab/animals</code>
              </p>
              <p>Response</p>
              <pre>
                <samp>
                  {JSON.stringify(
                    {
                      english: "cow",
                      standardArabic: "بقرة",
                      standardArabicTransliteration: "baqara",
                      egyptianArabic: "بقرة",
                      egyptianArabicTransliteration: "ba'ara",
                    },
                    null,
                    2
                  )}
                </samp>
              </pre>
            </section>
          </div>

          <footer class={footer}>
            <p>
              Made by{" "}
              <a href='https://github.com/selmetwa' target='_blank'>
                Sherif Elmetwally
              </a>
            </p>
            <a
              href='https://github.com/selmetwa/egyptian-arabic-vocab'
              target='_blank'
            >
              Source Code
            </a>
          </footer>
        </main>
      </body>
    </html>
  );
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
