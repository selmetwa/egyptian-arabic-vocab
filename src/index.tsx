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
app.use('/vocab/:dialect/:section', cors())
app.use('/vocab/:dialect/all', cors())

app.get("/", (c) => {

  // Accurate word counts for each dialect (verified from regenerated JSON data)
  const dialectCounts: Record<string, number> = {
    'darija': 2376,
    'egyptian': 6314,
    'levantine': 2511,
    'modern-standard-arabic': 3898
  };
  
  const totalCount = Object.values(dialectCounts).reduce((sum, count) => sum + count, 0);

  // Available sections for each dialect
  const dialectSections = {
    'darija': [
      'adjectives_5', 'adverbs_5', 'animals_5', 'around_the_house_4', 'cars_and_other_transportation_5',
      'clothing_jewelry_and_accessories_5', 'family_5', 'food_and_drink_5', 'health_and_medicine_5',
      'language_5', 'life_and_death_5', 'numbers_6', 'recreation_and_relaxation_5',
      'school_and_education_5', 'verbs_5', 'weather_5', 'work_and_professions_4'
    ],
    'egyptian': [
      'adjectives', 'adverbs', 'animals', 'around_the_house', 'cars_and_other_transportation',
      'city_and_transportation', 'clothing_jewelry_and_accessories', 'clothing', 'colors',
      'crime_and_punishment', 'education', 'emotions__and__personality_traits', 'family',
      'food_and_drink', 'food', 'geography', 'government_and_politics', 'health_and_medicine',
      'human_body', 'language', 'life_and_death', 'mankind_and_kinship', 'media_2', 'media_3',
      'media_and_the_arts', 'media', 'medicine', 'nature__and__weather', 'numbers',
      'recreation_and_relaxation', 'religion', 'school_and_education', 'sports__and__hobbies',
      'technology', 'time', 'verbs', 'vocabulary_from_around_the_house', 'war', 'weather',
      'work_and_money', 'work_and_professions'
    ],
    'levantine': [
      'adjectives_2', 'adverbs_2', 'animals_2', 'cars_and_other_transportation_2',
      'clothing_jewelry_and_accessories_2', 'family_2', 'food_and_drink_2', 'health_and_medicine_2',
      'language_2', 'life_and_death_2', 'numbers_2', 'recreation_and_relaxation_2',
      'school_and_education_2', 'the_human_body_and_describing_people_2', 'verbs_2',
      'weather_2', 'work_and_professions_2', 'work_and_professions'
    ],
    'modern-standard-arabic': [
      'animals', 'city_and_transportation', 'clothing', 'colors', 'crime_and_punishment',
      'education', 'emotions__and__personality_traits', 'food', 'geography', 'government_and_politics',
      'human_body', 'mankind_and_kinship', 'media_2', 'media_3', 'media_and_the_arts', 'media',
      'medicine', 'nature__and__weather', 'religion', 'sports__and__hobbies', 'technology',
      'time', 'vocabulary_from_around_the_house', 'war', 'work_and_money'
    ]
  };
  
  const body = css`
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
    color: #333;
    line-height: 1.6;
  `;

  const container = css`
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  `;

  const header = css`
    text-align: center;
    margin-bottom: 3rem;
    
    h1 {
      color: white;
      font-size: 3.5rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
      
      @media (max-width: 768px) {
        font-size: 2.5rem;
      }
    }
  `;

  const statsCard = css`
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    margin-bottom: 2rem;
    text-align: center;
    
    .stat-number {
      font-size: 2.5rem;
      font-weight: 700;
      color: #667eea;
      margin: 0;
    }
    
    .stat-label {
      font-size: 1.1rem;
      color: #666;
      margin: 0.5rem 0 0 0;
    }
    
    .source-link {
      display: inline-block;
      margin-top: 1rem;
      padding: 0.75rem 1.5rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      text-decoration: none;
      border-radius: 50px;
      font-weight: 600;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }
  `;

  const dialectsGrid = css`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  `;

    const dialectCard = css`
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 20px 40px rgba(0,0,0,0.15);
    }
    
    .dialect-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    
    .dialect-flag {
      width: 2rem;
      height: 2rem;
      border-radius: 50%;
      background: linear-gradient(135deg, #667eea, #764ba2);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 0.9rem;
    }
    
    .dialect-title {
      font-size: 1.3rem;
      font-weight: 600;
      color: #333;
      margin: 0;
    }
    
    .word-count {
      font-size: 0.9rem;
      color: #667eea;
      font-weight: 600;
    }
    
    .dialect-description {
      margin: 1rem 0;
      color: #666;
      line-height: 1.5;
    }
    
    .dialect-links {
      margin-top: 1rem;
    display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    
    .dialect-link {
      padding: 0.4rem 0.8rem;
      background: #f8f9ff;
      color: #667eea;
      text-decoration: none;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 500;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
      
      &:hover {
        background: #667eea;
        color: white;
        transform: translateY(-1px);
      }
    }
    
    .expand-btn {
      margin-top: 1rem;
      padding: 0.5rem 1rem;
      background: linear-gradient(135deg, #667eea, #764ba2);
      color: white;
      text-decoration: none;
      border-radius: 25px;
      font-size: 0.85rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
      display: inline-block;
      
      &:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
      }
    }
  `;

  const apiSection = css`
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    margin-bottom: 2rem;
    
    h2 {
      color: #333;
      font-size: 2rem;
      font-weight: 600;
      margin: 0 0 1.5rem 0;
      text-align: center;
    }
    
    h3 {
      color: #667eea;
      font-size: 1.3rem;
      font-weight: 600;
      margin: 2rem 0 1rem 0;
    }
    
    h4 {
      color: #555;
      font-size: 1.1rem;
      font-weight: 600;
      margin: 1.5rem 0 0.75rem 0;
    }
    
    p {
      color: #666;
      margin: 0.75rem 0;
      line-height: 1.6;
    }
    
    code {
      background: #f1f5f9;
      color: #667eea;
      padding: 0.2rem 0.4rem;
      border-radius: 4px;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      font-size: 0.9rem;
    }
    
    pre {
      background: #1e293b;
      color: #e2e8f0;
      padding: 1.5rem;
      border-radius: 12px;
      overflow-x: auto;
      margin: 1rem 0;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', monospace;
      box-shadow: 0 4px 16px rgba(0,0,0,0.1);
      
      code {
        background: none;
        color: #e2e8f0;
        padding: 0;
      }
      
      samp {
        color: #94a3b8;
      }
    }
  `;

  const legacySection = css`
    margin-top: 2rem;
    padding-top: 2rem;
    border-top: 2px solid #f1f5f9;
    
    h3 {
      color: #94a3b8;
      font-size: 1.1rem;
    }
    
    .legacy-links {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
      margin-top: 1rem;
    }
    
    .legacy-link {
      padding: 0.3rem 0.6rem;
      background: #f8fafc;
      color: #64748b;
      text-decoration: none;
      border-radius: 12px;
      font-size: 0.8rem;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
      
      &:hover {
        background: #e2e8f0;
        color: #475569;
      }
    }
  `;

  const footer = css`
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(10px);
    border-radius: 20px;
    padding: 2rem;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    border: 1px solid rgba(255,255,255,0.2);
    text-align: center;
    
    p {
      margin: 0.5rem 0;
      color: #666;
    }
    
    a {
      color: #667eea;
      text-decoration: none;
      font-weight: 500;
      transition: color 0.2s ease;
      
      &:hover {
        color: #764ba2;
      }
    }
  `;
  return c.html(
    <html>
      <head>
        <Style />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Arabic Vocabulary API</title>
      </head>
      <body class={body}>
        <div class={container}>
          <header class={header}>
            <h1>Arabic Vocabulary API</h1>
          </header>

          <div class={statsCard}>
            <h2 class="stat-number">{totalCount.toLocaleString()}</h2>
            <p class="stat-label">Words across 4 Arabic dialects</p>
          </div>

          {/* Dialects Grid */}
          <div class={dialectsGrid}>
            {/* Darija Card */}
            <div class={dialectCard} id="darija-card">
              <div class="dialect-header">
                <div class="dialect-flag">🇲🇦</div>
                <div>
                  <h3 class="dialect-title">Darija</h3>
                  <div class="word-count">{dialectCounts['darija']?.toLocaleString() || 0} words</div>
                </div>
              </div>
              <p class="dialect-description">Moroccan Arabic dialect with rich cultural expressions</p>
              
              <div class="dialect-links">
                <a href="/vocab/darija/all" class="dialect-link">All vocabulary</a>
                {dialectSections['darija'].slice(0, 4).map(section => (
                  <a href={`/vocab/darija/${section}`} class="dialect-link">
                    {section.replace(/_/g, ' ').replace(/\d+$/, '').trim()}
                  </a>
                ))}
              </div>
              <a href="#darija-endpoints" class="expand-btn">
                Show all {dialectSections['darija'].length} sections
              </a>
            </div>

            {/* Egyptian Card */}
            <div class={dialectCard} id="egyptian-card">
              <div class="dialect-header">
                <div class="dialect-flag">🇪🇬</div>
                <div>
                  <h3 class="dialect-title">Egyptian Arabic</h3>
                  <div class="word-count">{dialectCounts['egyptian']?.toLocaleString() || 0} words</div>
                </div>
              </div>
              <p class="dialect-description">Most widely understood Arabic dialect across the region</p>
              
              <div class="dialect-links">
                <a href="/vocab/egyptian/all" class="dialect-link">All vocabulary</a>
                {dialectSections['egyptian'].slice(0, 4).map(section => (
                  <a href={`/vocab/egyptian/${section}`} class="dialect-link">
                    {section.replace(/_/g, ' ').replace(/\d+$/, '').trim()}
                  </a>
                ))}
              </div>
              <a href="#egyptian-endpoints" class="expand-btn">
                Show all {dialectSections['egyptian'].length} sections
              </a>
            </div>

            {/* Levantine Card */}
            <div class={dialectCard} id="levantine-card">
              <div class="dialect-header">
                <div class="dialect-flag">🇱🇧</div>
                <div>
                  <h3 class="dialect-title">Levantine Arabic</h3>
                  <div class="word-count">{dialectCounts['levantine']?.toLocaleString() || 0} words</div>
                </div>
              </div>
              <p class="dialect-description">Spoken across Lebanon, Syria, Jordan, and Palestine</p>
              
              <div class="dialect-links">
                <a href="/vocab/levantine/all" class="dialect-link">All vocabulary</a>
                {dialectSections['levantine'].slice(0, 4).map(section => (
                  <a href={`/vocab/levantine/${section}`} class="dialect-link">
                    {section.replace(/_/g, ' ').replace(/\d+$/, '').trim()}
                  </a>
                ))}
              </div>
              <a href="#levantine-endpoints" class="expand-btn">
                Show all {dialectSections['levantine'].length} sections
              </a>
            </div>

            {/* Modern Standard Arabic Card */}
            <div class={dialectCard} id="modern-standard-arabic-card">
              <div class="dialect-header">
                <div class="dialect-flag">📚</div>
                <div>
                  <h3 class="dialect-title">Modern Standard Arabic</h3>
                  <div class="word-count">{dialectCounts['modern-standard-arabic']?.toLocaleString() || 0} words</div>
                </div>
              </div>
              <p class="dialect-description">Formal Arabic used in literature, media, and education</p>
              
              <div class="dialect-links">
                <a href="/vocab/modern-standard-arabic/all" class="dialect-link">All vocabulary</a>
                {dialectSections['modern-standard-arabic'].slice(0, 4).map(section => (
                  <a href={`/vocab/modern-standard-arabic/${section}`} class="dialect-link">
                    {section.replace(/_/g, ' ').replace(/\d+$/, '').trim()}
                  </a>
                ))}
              </div>
              <a href="#msa-endpoints" class="expand-btn">
                Show all {dialectSections['modern-standard-arabic'].length} sections
              </a>
            </div>
          </div>

                    {/* API Documentation */}
          <section class={apiSection}>
            <h2>🚀 API Documentation</h2>
            
            <h3>Dialect Endpoints</h3>
            <p>Access vocabulary for specific Arabic dialects and sections:</p>
              <pre>
              <code>GET /vocab/:dialect/:section{"\n"}GET /vocab/:dialect/all</code>
              </pre>
              <p>
              Available dialects: <code>darija</code>, <code>egyptian</code>, <code>levantine</code>, <code>modern-standard-arabic</code>
            </p>

            <h4>Available Endpoints by Dialect</h4>
            
            <details id="darija-endpoints" style="margin: 1rem 0; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
              <summary style="cursor: pointer; font-weight: 600; color: #667eea;">
                🇲🇦 Darija (Moroccan Arabic) - {dialectSections['darija'].length + 1} endpoints
              </summary>
              <div style="margin-top: 1rem;">
                <p><a href="/vocab/darija/all" style="color: #667eea; text-decoration: none;"><code>GET /vocab/darija/all</code></a> - All vocabulary</p>
                {dialectSections['darija'].map(section => (
                  <p><a href={`/vocab/darija/${section}`} style="color: #667eea; text-decoration: none;"><code>GET /vocab/darija/{section}</code></a></p>
                ))}
              </div>
            </details>

            <details id="egyptian-endpoints" style="margin: 1rem 0; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
              <summary style="cursor: pointer; font-weight: 600; color: #667eea;">
                🇪🇬 Egyptian Arabic - {dialectSections['egyptian'].length + 1} endpoints
              </summary>
              <div style="margin-top: 1rem;">
                <p><a href="/vocab/egyptian/all" style="color: #667eea; text-decoration: none;"><code>GET /vocab/egyptian/all</code></a> - All vocabulary</p>
                {dialectSections['egyptian'].map(section => (
                  <p><a href={`/vocab/egyptian/${section}`} style="color: #667eea; text-decoration: none;"><code>GET /vocab/egyptian/{section}</code></a></p>
                ))}
              </div>
            </details>

            <details id="levantine-endpoints" style="margin: 1rem 0; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
              <summary style="cursor: pointer; font-weight: 600; color: #667eea;">
                🇱🇧 Levantine Arabic - {dialectSections['levantine'].length + 1} endpoints
              </summary>
              <div style="margin-top: 1rem;">
                <p><a href="/vocab/levantine/all" style="color: #667eea; text-decoration: none;"><code>GET /vocab/levantine/all</code></a> - All vocabulary</p>
                {dialectSections['levantine'].map(section => (
                  <p><a href={`/vocab/levantine/${section}`} style="color: #667eea; text-decoration: none;"><code>GET /vocab/levantine/{section}</code></a></p>
                ))}
              </div>
            </details>

            <details id="msa-endpoints" style="margin: 1rem 0; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem;">
              <summary style="cursor: pointer; font-weight: 600; color: #667eea;">
                📚 Modern Standard Arabic - {dialectSections['modern-standard-arabic'].length + 1} endpoints
              </summary>
              <div style="margin-top: 1rem;">
                <p><a href="/vocab/modern-standard-arabic/all" style="color: #667eea; text-decoration: none;"><code>GET /vocab/modern-standard-arabic/all</code></a> - All vocabulary</p>
                {dialectSections['modern-standard-arabic'].map(section => (
                  <p><a href={`/vocab/modern-standard-arabic/${section}`} style="color: #667eea; text-decoration: none;"><code>GET /vocab/modern-standard-arabic/{section}</code></a></p>
                ))}
              </div>
            </details>

            <h4>Examples</h4>
            <p>Get all Egyptian Arabic vocabulary:</p>
            <pre><code>GET /vocab/egyptian/all</code></pre>
            <p>Get Darija animals vocabulary:</p>
            <pre><code>GET /vocab/darija/animals_5</code></pre>
            
            <h4>Response Format</h4>
              <pre>
                <samp>
                  {JSON.stringify(
                    {
                    english: "good",
                    transliteration: "kuwáyyis",
                    arabic: "كُوَيِّس",
                    audioUrl: "http://media.lingualism.com/.../ecav57-1.mp3",
                    source: "adjectives"
                    },
                    null,
                    2
                  )}
                </samp>
              </pre>

            <div class={legacySection}>
              <h3>Legacy Endpoints</h3>
              <p>Original Egyptian Arabic endpoints (backwards compatibility):</p>
              <pre><code>GET /vocab/:section</code></pre>
              <p>Example: <code>GET /vocab/animals</code></p>
              
              <div class="legacy-links">
                {sections.map((section) => (
                  <a href={`/vocab/${section}`} class="legacy-link">{section}</a>
                ))}
              </div>
            </div>
            </section>

          {/* Footer */}
          <footer class={footer}>
            <p>
              Made with ❤️ by{" "}
              <a href='https://github.com/selmetwa' target='_blank'>
                Sherif Elmetwally
              </a>
            </p>
            <p>
              <a href='https://github.com/selmetwa/egyptian-arabic-vocab' target='_blank'>
                View Source Code
              </a>
            </p>
          </footer>
        </div>
        

      </body>
    </html>
  );
});

// Legacy endpoint for backwards compatibility
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

// New dialect-specific endpoints
app.get("/vocab/:dialect/:section", async (c) => {
  const dialect = c.req.param("dialect");
  const section = c.req.param("section");

  const filePath = path.join("csv-v2", dialect, "json", `${section}.json`);

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

// Get all vocabulary for a specific dialect
app.get("/vocab/:dialect/all", async (c) => {
  const dialect = c.req.param("dialect");

  const filePath = path.join("csv-v2", dialect, "json", "all.json");

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
