import React from 'react';
import {ArrowUpRight} from 'lucide-react';

const instagram='https://www.instagram.com/strivx.technologies/';
const directions='https://www.google.com/maps/search/?api=1&query=Royal+Complex+Malad+East+Mumbai';

export default function SkyfoolsFooter(){return <footer>
  <div className="footer-top"><div><a className="wordmark" href="#home">the skyfools</a><p>Come for the coffee.<br/>Stay for the feeling.</p></div><a className="back-top" href="#home">Back to the beginning <ArrowUpRight size={22}/></a></div>
  <div className="footer-columns">
    <div><h3>Skyfools</h3><p>Good coffee, curious plates and a little more time to enjoy both.</p></div>
    <div><h3>Explore</h3><a href="#home">The walkthrough</a><a href="#menu">Highlights</a><a href="#book">Menu book</a><a href="#story">Our story</a><a href="#gallery">Gallery</a><a href="#visit">Visit us</a></div>
    <div><h3>Visit</h3><address>Royal Complex,<br/>Malad East, Mumbai</address><a href={directions} target="_blank" rel="noreferrer">Get directions ↗</a></div>
    <div><h3>Connect</h3><a href={instagram} target="_blank" rel="noreferrer">Instagram ↗</a><a href="/menu.html">Explore the menu ↗</a></div>
  </div>
  <div className="footer-bottom"><span>© 2026 THE SKYFOOLS</span><span>COFFEE · COMPANY · CURIOSITY</span></div>
</footer>}
