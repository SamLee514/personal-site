import React from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Image from "../components/image"
import SEO from "../components/seo"

const IndexPage = () => (
  <Layout>
    <SEO title="Home" />
    <h1>Hi! My name is Sam.</h1>
    <p>This is my website.</p>
    <p>We're still moving in, but take a look around!</p>
    <hr/>
    <p>I'm a junior at Vanderbilt University studying Computer Science, Math and French Horn Performance.
       I'm also an AI engineer intern at <a href='http://fringeai.com/' rel='noopener' target='none'>FringeAI</a>, and
       I do research at <a href='http://catlab.psy.vanderbilt.edu/' rel='noopener' target='none'>The Palmeri Lab at Vanderbilt</a>.</p>
    <p>Actively looking for SWE internship opportunities for Summer 2021.</p>
    <p>Here's my <a href="./Samuel_Lee_standard_resume_2020.pdf" download>~resume~</a>. "Everything you'll ever need to know is in that note." Jim to Pam, Season 9 Episode 22.</p>
    <p>Here's my <a href='https://github.com/SamLee514' rel='noopener' target='none'>GitHub</a>. All my work lives here.</p>
    <p>Here's my <a href='https://www.linkedin.com/in/samuelranlee/' rel='noopener' target='none'>LinkedIn</a>. Please connect with me this is my only social media.</p>
    <p>Just kidding. But I'm not ready for that yet, let's keep this professional.</p>
    <p>I've worked on a few things on the side. Here's the most recent one: <a href='https://vandyhacks.org/' rel='noopener' target='none'>VandyHacks Promo Site</a>.</p>
    <p>Here's the default Gatsby starter astronaut. He's good company (he'll move out soon, don't worry).</p>
    <div style={{ maxWidth: `300px`, marginBottom: `1.45rem` }}>
      <Image />
    </div>
    <Link to="/page-2/">Go to page 2</Link> <br />
    <Link to="/using-typescript/">Go to "Using TypeScript"</Link>
  </Layout>
)

export default IndexPage
