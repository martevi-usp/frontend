// Line drawings of each museum's real facade, traced from a CC-licensed
// Wikimedia Commons photograph by ../salas/assets/gerar_predio.py (local
// std. deviation sky/skyline detection + Hough line extraction — see that
// script's own docstring). Not hand-drawn illustration; a deterministic
// trace of a real photo, matching salas.html's own building-drawing
// convention (viewBox 0 0 340 260, ground line at y=238).
//
// Source photo · author · license, per Commons' attribution requirement:
//   met         Metropolitan Museum of Art (The Met) - Central Park, NYC.jpg · Hugo Schneider · CC BY-SA 2.0
//   aic         Art Institute of Chicago (51575570710).jpg · Flickr upload · CC BY 2.0
//   cleveland   Cleveland Museum of Art.jpg · Erik Drost · CC BY 2.0
//   harvard     Harvard Art Museums (54941166385).jpg · Flickr upload · CC BY 2.0
//   rijksmuseum reused from ../salas/assets/exemplos-gerados/rijks.svg (already generated there)
//   smithsonian Smithsonian Institution Building (53831938398).jpg · ajay_suresh (Flickr) · CC BY 2.0
//   vam         Victoria & Albert Museum Entrance, London, UK - Diliff.jpg · Diliff · CC BY-SA 3.0
// All at commons.wikimedia.org/wiki/File:<name>. To regenerate: download the
// photo, run gerar_predio.py, check <id>_debug.png (a bad sky/skyline read
// is obvious there), paste the traced <path>s in, s/stroke-width/strokeWidth/.
import type { ComponentType } from 'react'
import type { ProviderId } from '../../api/types'

function MetBuilding() {
  return (
    <>
      <path d="M6 238h328" strokeWidth="1.6"/>
      <path d="M24.0 238L24.0 133.1 L29.8 133.1 L32.0 125.5 L35.9 125.5 L35.9 77.3 L40.8 75.7 L43.2 75.7 L43.2 108.8 L45.4 104.8 L53.0 107.7 L56.9 101.6 L66.9 107.7 L72.3 104.6 L75.4 108.5 L78.9 105.7 L87.9 108.5 L90.0 105.5 L98.4 108.5 L102.7 105.3 L103.9 98.3 L105.8 108.5 L108.2 100.5 L117.3 108.5 L121.0 85.9 L124.7 107.7 L130.7 101.3 L139.5 107.5 L146.3 104.2 L147.9 108.5 L152.0 105.3 L160.2 108.5 L162.7 105.1 L169.9 108.5 L172.6 105.1 L177.9 108.1 L185.9 105.1 L190.4 108.3 L191.5 104.2 L198.7 107.1 L207.3 101.1 L212.4 107.1 L220.5 104.2 L220.5 108.1 L225.0 105.1 L232.2 108.1 L235.5 105.0 L243.3 108.1 L243.8 88.4 L243.8 105.2 L249.0 105.2 L250.5 107.9 L256.6 104.6 L263.0 107.9 L265.2 103.8 L272.0 106.7 L279.8 100.5 L286.2 106.7 L291.8 103.5 L294.6 103.5 L294.6 107.5 L302.4 104.6 L302.4 124.2 L307.6 124.2 L310.0 132.0 L316.0 132.0L316.0 238" strokeWidth="1.7"/>
      <path d="M33.4 230.5L304.7 230.5" strokeWidth="1.55"/>
      <path d="M33.4 223.8L304.7 223.8" strokeWidth="1.55"/>
      <path d="M33.4 112.7L304.7 112.7" strokeWidth="1.55"/>
      <path d="M33.4 169.3L304.7 169.3" strokeWidth="1.55"/>
      <path d="M33.4 214.0L304.7 214.0" strokeWidth="1.55"/>
      <path d="M33.4 126.0L304.7 126.0" strokeWidth="1.55"/>
      <path d="M194.5 104.8L194.5 232.5" strokeWidth="1.2"/>
      <path d="M269.3 104.8L269.3 215.6" strokeWidth="1.2"/>
      <path d="M298.7 104.8L298.7 185.7" strokeWidth="1.2"/>
      <path d="M142.2 116.1L142.2 193.8" strokeWidth="1.2"/>
      <path d="M214.0 143.2L214.0 209.5" strokeWidth="1.0"/>
      <path d="M201.0 122.3L201.0 185.7" strokeWidth="1.0"/>
      <path d="M115.0 145.7L115.0 204.6" strokeWidth="1.0"/>
      <path d="M289.3 160.1L289.3 204.6" strokeWidth="1.0"/>
      <path d="M80.2 163.8L80.2 204.6" strokeWidth="1.0"/>
      <path d="M27.5 174.6L27.5 212.3" strokeWidth="1.0"/>
      <path d="M50.0 149.0L50.0 185.7" strokeWidth="1.0"/>
      <path d="M269.1 105.0L304.7 105.0" strokeWidth="1.0"/>
      <path d="M85.8 202.9L85.8 238.0" strokeWidth="1.0"/>
      <path d="M68.1 155.0L68.1 185.7" strokeWidth="1.0"/>
      <path d="M258.3 174.6L258.3 204.6" strokeWidth="1.0"/>
      <path d="M40.5 143.2L40.5 172.4" strokeWidth="1.0"/>
      <path d="M124.9 171.6L124.9 196.3" strokeWidth="1.0"/>
      <path d="M35.8 200.0L35.8 222.8" strokeWidth="1.0"/>
      <path d="M185.7 163.8L185.7 185.7" strokeWidth="1.0"/>
      <path d="M152.2 163.8L152.2 185.7" strokeWidth="1.0"/>
      <path d="M247.4 206.8L247.4 228.5" strokeWidth="1.0"/>
      <path d="M214.0 104.8L214.0 125.4" strokeWidth="1.0"/>
    </>
  )
}

function AicBuilding() {
  return (
    <>
      <path d="M6 238h328" strokeWidth="1.6"/>
      <path d="M24.0 238L24.0 129.0 L59.4 129.0 L59.4 117.7 L64.1 117.7 L76.0 129.0 L93.3 129.0 L93.3 115.1 L102.3 119.6 L164.1 95.3 L171.1 83.8 L175.2 85.3 L179.6 94.9 L242.0 119.4 L251.4 114.9 L251.4 130.4 L272.6 130.4 L284.4 117.7 L288.4 118.2 L288.4 129.4 L316.0 129.4L316.0 238" strokeWidth="1.7"/>
      <path d="M24.6 136.5L313.9 136.5" strokeWidth="1.55"/>
      <path d="M24.6 207.0L313.9 207.0" strokeWidth="1.55"/>
      <path d="M24.6 166.7L313.9 166.7" strokeWidth="1.55"/>
      <path d="M24.6 227.9L313.9 227.9" strokeWidth="1.55"/>
      <path d="M97.5 125.1L248.1 125.1" strokeWidth="1.2"/>
      <path d="M97.5 108.1L248.1 108.1" strokeWidth="1.2"/>
      <path d="M111.2 113.2L227.2 113.2" strokeWidth="1.2"/>
      <path d="M272.8 116.3L272.8 223.1" strokeWidth="1.2"/>
      <path d="M299.0 131.0L299.0 228.3" strokeWidth="1.2"/>
      <path d="M24.6 238.0L122.0 238.0" strokeWidth="1.2"/>
      <path d="M76.8 131.0L76.8 217.2" strokeWidth="1.2"/>
      <path d="M279.7 146.7L279.7 228.3" strokeWidth="1.2"/>
      <path d="M245.7 116.3L245.7 170.7" strokeWidth="1.0"/>
      <path d="M100.1 131.0L100.1 184.1" strokeWidth="1.0"/>
      <path d="M86.7 131.0L86.7 177.6" strokeWidth="1.0"/>
      <path d="M62.0 234.1L105.8 234.1" strokeWidth="1.0"/>
      <path d="M165.6 131.0L165.6 170.7" strokeWidth="1.0"/>
      <path d="M44.2 139.5L44.2 177.6" strokeWidth="1.0"/>
      <path d="M192.7 185.3L192.7 223.1" strokeWidth="1.0"/>
      <path d="M65.1 146.7L65.1 177.6" strokeWidth="1.0"/>
      <path d="M179.4 150.2L179.4 177.6" strokeWidth="1.0"/>
      <path d="M257.8 150.2L257.8 177.6" strokeWidth="1.0"/>
      <path d="M257.8 199.1L257.8 223.1" strokeWidth="1.0"/>
      <path d="M97.5 120.5L115.0 120.5" strokeWidth="1.0"/>
    </>
  )
}

function ClevelandBuilding() {
  return (
    <>
      <path d="M6 238h328" strokeWidth="1.6"/>
      <path d="M24.0 238L24.0 122.1 L29.3 127.1 L30.6 133.8 L35.3 136.7 L40.6 135.9 L45.6 139.7 L59.6 139.7 L60.2 145.3 L162.9 144.8 L167.2 135.7 L170.1 134.9 L175.7 145.8 L269.2 145.8 L273.1 144.5 L277.4 128.3 L285.0 124.6 L287.4 115.3 L290.3 115.3 L294.6 108.0 L301.8 105.9 L314.4 108.4 L316.0 105.7L316.0 238" strokeWidth="1.7"/>
      <path d="M28.6 190.4L313.6 190.4" strokeWidth="1.55"/>
      <path d="M28.6 237.7L313.6 237.7" strokeWidth="1.55"/>
      <path d="M288.3 108.8L288.3 238.0" strokeWidth="1.2"/>
      <path d="M306.4 108.8L306.4 238.0" strokeWidth="1.2"/>
      <path d="M28.4 123.4L28.4 238.0" strokeWidth="1.2"/>
      <path d="M38.8 138.2L38.8 238.0" strokeWidth="1.2"/>
      <path d="M122.4 150.9L122.4 230.3" strokeWidth="1.0"/>
      <path d="M283.7 108.8L283.7 181.3" strokeWidth="1.0"/>
      <path d="M54.5 131.1L54.5 194.5" strokeWidth="1.0"/>
      <path d="M141.5 172.2L141.5 221.8" strokeWidth="1.0"/>
      <path d="M195.4 172.2L195.4 221.8" strokeWidth="1.0"/>
      <path d="M156.9 181.1L156.9 230.3" strokeWidth="1.0"/>
      <path d="M149.0 191.5L149.0 238.0" strokeWidth="1.0"/>
      <path d="M217.0 181.1L217.0 221.8" strokeWidth="1.0"/>
      <path d="M273.4 133.4L313.6 133.4" strokeWidth="1.0"/>
      <path d="M273.4 124.2L313.6 124.2" strokeWidth="1.0"/>
      <path d="M273.4 141.4L313.6 141.4" strokeWidth="1.0"/>
      <path d="M273.4 115.3L313.6 115.3" strokeWidth="1.0"/>
      <path d="M28.6 141.4L68.0 141.4" strokeWidth="1.0"/>
      <path d="M163.0 172.2L163.0 211.0" strokeWidth="1.0"/>
      <path d="M181.1 185.8L181.1 221.8" strokeWidth="1.0"/>
      <path d="M174.4 191.5L174.4 221.8" strokeWidth="1.0"/>
      <path d="M253.1 191.5L253.1 221.8" strokeWidth="1.0"/>
      <path d="M190.0 191.5L190.0 221.8" strokeWidth="1.0"/>
      <path d="M91.4 216.9L91.4 238.0" strokeWidth="1.0"/>
    </>
  )
}

function HarvardBuilding() {
  return (
    <>
      <path d="M6 238h328" strokeWidth="1.6"/>
      <path d="M24.0 238L24.0 180.0 L26.1 177.3 L31.1 177.3 L31.1 181.3 L38.8 183.3 L38.8 170.2 L48.1 170.2 L48.1 156.4 L64.1 149.6 L64.1 83.1 L67.9 87.6 L67.9 147.2 L75.5 144.7 L76.8 102.6 L76.8 142.7 L81.2 141.8 L81.2 75.2 L85.7 75.2 L85.7 139.0 L112.4 127.9 L123.9 116.1 L166.6 95.8 L171.7 95.0 L175.4 100.1 L198.3 90.7 L218.0 128.5 L221.4 128.5 L221.4 135.7 L256.9 127.4 L256.9 132.2 L261.1 132.2 L261.1 139.6 L282.9 149.8 L303.7 149.8 L307.3 154.4 L307.3 159.9 L316.0 163.0L316.0 238" strokeWidth="1.7"/>
      <path d="M28.7 206.9L308.4 206.9" strokeWidth="1.55"/>
      <path d="M90.3 154.3L308.4 154.3" strokeWidth="1.55"/>
      <path d="M28.7 179.6L240.8 179.6" strokeWidth="1.55"/>
      <path d="M124.4 99.1L124.4 232.8" strokeWidth="1.2"/>
      <path d="M55.6 121.2L184.3 121.2" strokeWidth="1.2"/>
      <path d="M55.6 236.5L184.3 236.5" strokeWidth="1.2"/>
      <path d="M212.4 91.0L212.4 214.6" strokeWidth="1.2"/>
      <path d="M28.7 233.5L150.8 233.5" strokeWidth="1.2"/>
      <path d="M113.3 126.4L113.3 235.7" strokeWidth="1.2"/>
      <path d="M255.8 126.4L255.8 227.9" strokeWidth="1.2"/>
      <path d="M182.6 99.1L182.6 199.3" strokeWidth="1.2"/>
      <path d="M233.5 132.9L233.5 227.9" strokeWidth="1.2"/>
      <path d="M94.8 114.6L184.3 114.6" strokeWidth="1.2"/>
      <path d="M94.8 127.4L184.3 127.4" strokeWidth="1.2"/>
      <path d="M94.8 108.2L184.3 108.2" strokeWidth="1.2"/>
      <path d="M86.7 138.8L86.7 225.0" strokeWidth="1.2"/>
      <path d="M197.2 91.0L197.2 175.8" strokeWidth="1.2"/>
      <path d="M163.8 99.1L163.8 175.8" strokeWidth="1.0"/>
      <path d="M48.6 158.5L48.6 232.8" strokeWidth="1.0"/>
      <path d="M279.3 151.9L279.3 225.0" strokeWidth="1.0"/>
      <path d="M241.8 126.4L241.8 199.3" strokeWidth="1.0"/>
      <path d="M140.8 99.1L140.8 161.8" strokeWidth="1.0"/>
      <path d="M168.4 91.0L168.4 151.6" strokeWidth="1.0"/>
      <path d="M63.9 179.5L63.9 238.0" strokeWidth="1.0"/>
      <path d="M261.0 179.6L308.4 179.6" strokeWidth="1.0"/>
      <path d="M156.8 99.1L156.8 139.4" strokeWidth="1.0"/>
      <path d="M301.1 192.2L301.1 219.9" strokeWidth="1.0"/>
      <path d="M204.7 233.5L231.1 233.5" strokeWidth="1.0"/>
      <path d="M156.8 149.8L156.8 175.8" strokeWidth="1.0"/>
      <path d="M182.6 192.2L182.6 214.6" strokeWidth="1.0"/>
      <path d="M221.4 155.6L221.4 175.8" strokeWidth="1.0"/>
    </>
  )
}

function RijksmuseumBuilding() {
  return (
    <>
      <path d="M6 238h328" strokeWidth="1.6"/>
      <path d="M24.0 238L24.0 238.0 L61.9 238.0 L61.9 161.2 L81.5 140.4 L90.5 140.4 L90.5 111.3 L100.9 84.8 L103.3 85.4 L113.3 111.9 L113.3 140.3 L123.2 140.3 L125.9 121.7 L130.7 121.7 L139.9 115.4 L143.0 117.5 L143.0 113.6 L159.8 104.9 L163.9 106.0 L166.8 102.9 L167.8 106.0 L169.1 100.0 L198.3 113.6 L200.1 119.3 L204.8 117.5 L206.5 121.9 L213.5 121.9 L215.8 124.1 L215.8 140.3 L226.7 140.3 L226.7 112.5 L239.1 85.2 L249.9 112.3 L249.9 140.3 L258.9 140.3 L278.2 160.4 L278.2 171.8 L284.2 171.8 L284.2 237.9 L287.3 237.9 L287.3 172.1 L294.2 170.9 L298.9 171.7 L299.3 237.9 L299.3 171.7 L302.2 171.1 L311.6 171.1 L311.6 237.9 L316.0 237.9L316.0 238" strokeWidth="1.7"/>
      <path d="M209.0 191.4L310.2 191.4" strokeWidth="1.55"/>
      <path d="M209.0 171.7L310.2 171.7" strokeWidth="1.55"/>
      <path d="M76.1 191.4L173.5 191.4" strokeWidth="1.55"/>
      <path d="M76.1 171.7L173.5 171.7" strokeWidth="1.55"/>
      <path d="M191.9 237.8L281.1 237.8" strokeWidth="1.55"/>
      <path d="M76.1 237.8L148.5 237.8" strokeWidth="1.55"/>
      <path d="M147.5 171.9L147.5 236.0" strokeWidth="1.55"/>
      <path d="M112.0 112.3L112.0 159.9" strokeWidth="1.2"/>
      <path d="M191.8 192.5L191.8 232.4" strokeWidth="1.2"/>
      <path d="M152.6 122.3L183.3 122.3" strokeWidth="1.2"/>
      <path d="M97.7 84.8L97.7 106.0" strokeWidth="1.0"/>
      <path d="M268.7 140.1L268.7 159.9" strokeWidth="1.0"/>
      <path d="M243.8 90.2L243.8 109.7" strokeWidth="1.0"/>
      <path d="M261.8 171.9L261.8 190.9" strokeWidth="1.0"/>
      <path d="M268.7 171.9L268.7 190.9" strokeWidth="1.0"/>
      <path d="M72.5 171.9L72.5 190.9" strokeWidth="1.0"/>
      <path d="M85.8 171.9L85.8 190.9" strokeWidth="1.0"/>
      <path d="M93.5 171.9L93.5 190.9" strokeWidth="1.0"/>
      <path d="M138.9 171.9L138.9 190.9" strokeWidth="1.0"/>
      <path d="M296.5 171.9L296.5 190.9" strokeWidth="1.0"/>
      <path d="M160.0 171.9L160.0 190.9" strokeWidth="1.0"/>
      <path d="M173.2 171.9L173.2 190.9" strokeWidth="1.0"/>
      <path d="M275.1 171.9L275.1 190.9" strokeWidth="1.0"/>
      <path d="M208.9 171.9L208.9 190.9" strokeWidth="1.0"/>
      <path d="M288.1 171.9L288.1 190.9" strokeWidth="1.0"/>
      <path d="M234.6 171.9L234.6 190.9" strokeWidth="1.0"/>
      <path d="M80.6 171.9L80.6 190.9" strokeWidth="1.0"/>
      <path d="M112.0 171.9L112.0 190.9" strokeWidth="1.0"/>
      <path d="M216.9 171.9L216.9 190.9" strokeWidth="1.0"/>
      <path d="M248.6 171.9L248.6 190.9" strokeWidth="1.0"/>
      <path d="M243.8 171.9L243.8 190.9" strokeWidth="1.0"/>
      <path d="M152.2 171.9L152.2 190.9" strokeWidth="1.0"/>
      <path d="M230.2 171.9L230.2 190.9" strokeWidth="1.0"/>
      <path d="M120.4 171.9L120.4 190.9" strokeWidth="1.0"/>
      <path d="M165.2 171.9L165.2 190.9" strokeWidth="1.0"/>
      <path d="M283.3 171.9L283.3 190.9" strokeWidth="1.0"/>
      <path d="M222.0 171.9L222.0 190.9" strokeWidth="1.0"/>
      <path d="M125.5 171.9L125.5 190.9" strokeWidth="1.0"/>
      <path d="M309.2 171.9L309.2 190.9" strokeWidth="1.0"/>
      <path d="M301.5 171.9L301.5 190.9" strokeWidth="1.0"/>
      <path d="M234.6 121.5L234.6 140.4" strokeWidth="1.0"/>
      <path d="M106.4 121.5L106.4 140.4" strokeWidth="1.0"/>
    </>
  )
}

function SmithsonianBuilding() {
  return (
    <>
      <path d="M6 238h328" strokeWidth="1.6"/>
      <path d="M30.7 238L30.7 163.6 L36.5 170.1 L44.5 162.3 L53.1 165.2 L53.1 117.8 L60.4 112.6 L64.7 96.7 L67.8 99.5 L70.1 114.1 L76.5 121.9 L76.5 141.5 L78.1 134.6 L80.9 133.5 L86.7 151.7 L133.3 151.7 L133.3 117.6 L144.2 107.0 L148.7 88.1 L150.6 88.1 L153.2 105.5 L163.6 118.0 L163.6 138.9 L168.5 126.9 L170.6 126.9 L176.5 139.1 L176.5 71.9 L187.6 69.4 L187.6 36.4 L191.6 36.4 L191.6 69.4 L203.8 72.0 L203.8 152.9 L241.7 152.9 L241.7 142.1 L252.0 140.2 L255.6 141.3 L255.6 153.3 L258.5 153.3 L259.5 147.3 L262.3 147.3 L266.6 120.0 L272.4 118.5 L272.4 184.2 L282.9 184.2 L282.9 181.6 L286.9 181.6 L288.8 184.9 L303.2 184.9 L310.7 179.8L310.7 238" strokeWidth="1.7"/>
      <path d="M24.0 178.9L316.0 178.9" strokeWidth="1.55"/>
      <path d="M185.2 41.0L185.2 223.1" strokeWidth="1.55"/>
      <path d="M67.0 98.9L67.0 238.0" strokeWidth="1.2"/>
      <path d="M263.8 115.5L263.8 229.7" strokeWidth="1.2"/>
      <path d="M35.8 231.8L132.3 231.8" strokeWidth="1.2"/>
      <path d="M146.4 98.9L146.4 195.2" strokeWidth="1.2"/>
      <path d="M217.5 231.8L309.6 231.8" strokeWidth="1.2"/>
      <path d="M87.6 115.5L87.6 195.2" strokeWidth="1.0"/>
      <path d="M42.7 163.9L42.7 238.0" strokeWidth="1.0"/>
      <path d="M129.9 150.1L129.9 195.2" strokeWidth="1.0"/>
      <path d="M296.1 195.1L296.1 238.0" strokeWidth="1.0"/>
      <path d="M119.6 183.1L119.6 223.1" strokeWidth="1.0"/>
      <path d="M92.7 163.9L92.7 195.2" strokeWidth="1.0"/>
      <path d="M113.3 163.9L113.3 195.2" strokeWidth="1.0"/>
      <path d="M107.8 163.9L107.8 195.2" strokeWidth="1.0"/>
      <path d="M300.4 189.9L300.4 217.2" strokeWidth="1.0"/>
      <path d="M219.8 173.5L219.8 195.2" strokeWidth="1.0"/>
      <path d="M98.8 173.5L98.8 195.2" strokeWidth="1.0"/>
    </>
  )
}

function VamBuilding() {
  return (
    <>
      <path d="M6 238h328" strokeWidth="1.6"/>
      <path d="M46.2 238L46.2 95.6 L51.6 96.7 L52.8 93.6 L58.6 94.7 L58.6 82.7 L64.5 87.3 L64.5 79.4 L70.6 75.7 L70.6 65.5 L74.3 64.0 L76.4 65.7 L77.4 63.5 L86.5 74.1 L101.2 80.2 L103.7 79.2 L114.5 89.4 L114.5 84.3 L120.4 80.5 L120.4 73.0 L126.7 73.0 L126.7 42.9 L133.3 46.2 L133.3 37.9 L136.2 32.2 L139.0 32.2 L142.3 43.1 L145.6 43.1 L148.8 25.5 L151.1 24.9 L158.2 37.7 L158.2 47.5 L163.1 49.8 L166.6 42.6 L168.6 42.6 L172.7 69.8 L176.9 75.7 L176.9 99.5 L184.9 99.5 L184.9 109.0 L191.7 109.0 L193.0 126.1 L193.0 106.3 L196.5 106.3 L196.5 132.9 L208.7 138.2 L211.2 152.2 L212.5 144.6 L214.5 144.6 L216.1 154.2 L216.1 144.1 L232.5 144.1 L237.1 123.5 L239.0 123.1 L246.4 150.4 L256.3 156.3 L259.3 165.4 L262.7 164.4 L266.1 159.0 L269.0 165.1 L273.5 163.1 L277.9 168.0 L286.5 168.0 L287.2 171.2 L290.1 171.7 L290.1 159.0 L293.8 159.0L293.8 238" strokeWidth="1.7"/>
      <path d="M62.1 183.0L273.3 183.0" strokeWidth="1.55"/>
      <path d="M62.1 139.9L273.3 139.9" strokeWidth="1.55"/>
      <path d="M145.8 22.0L145.8 214.6" strokeWidth="1.55"/>
      <path d="M100.1 42.6L100.1 228.6" strokeWidth="1.55"/>
      <path d="M110.8 42.6L110.8 214.6" strokeWidth="1.55"/>
      <path d="M165.5 42.6L165.5 214.6" strokeWidth="1.55"/>
      <path d="M68.5 79.8L68.5 228.6" strokeWidth="1.55"/>
      <path d="M62.1 238.0L207.2 238.0" strokeWidth="1.55"/>
      <path d="M118.4 42.6L118.4 178.3" strokeWidth="1.55"/>
      <path d="M87.7 79.8L87.7 214.6" strokeWidth="1.55"/>
      <path d="M50.0 102.9L50.0 228.6" strokeWidth="1.55"/>
      <path d="M62.1 112.3L180.3 112.3" strokeWidth="1.55"/>
      <path d="M186.6 102.9L186.6 214.6" strokeWidth="1.2"/>
      <path d="M240.6 140.7L240.6 214.6" strokeWidth="1.2"/>
      <path d="M260.5 144.3L260.5 214.6" strokeWidth="1.2"/>
      <path d="M177.1 144.3L177.1 214.6" strokeWidth="1.2"/>
      <path d="M252.1 144.3L252.1 214.6" strokeWidth="1.2"/>
      <path d="M220.5 144.3L220.5 214.6" strokeWidth="1.2"/>
      <path d="M123.3 117.1L123.3 178.3" strokeWidth="1.2"/>
      <path d="M195.4 102.9L195.4 140.7" strokeWidth="1.0"/>
      <path d="M145.4 85.5L180.3 85.5" strokeWidth="1.0"/>
      <path d="M145.4 71.6L180.3 71.6" strokeWidth="1.0"/>
      <path d="M145.4 50.9L180.3 50.9" strokeWidth="1.0"/>
      <path d="M210.9 144.3L210.9 178.3" strokeWidth="1.0"/>
      <path d="M204.9 144.3L204.9 178.3" strokeWidth="1.0"/>
    </>
  )
}

export const BUILDINGS: Record<ProviderId, ComponentType> = {
  met: MetBuilding,
  aic: AicBuilding,
  cleveland: ClevelandBuilding,
  harvard: HarvardBuilding,
  rijksmuseum: RijksmuseumBuilding,
  smithsonian: SmithsonianBuilding,
  vam: VamBuilding,
}

