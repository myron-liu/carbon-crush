import { TOKEN_TO_IMAGE_PATH_MAP } from './Gameboard.jsx';
import { DEFAULT_TOKENS } from '../game/token.js'

const TOKEN_TO_NAME_MAP = {
  'carbon-dioxide': 'CARBON DIOXIDE',
  'nitrous-oxide': 'NITROUS OXIDE',
  'hfc': 'HYDROFLUORO- CARBONS',
  'pfc': 'PERFLUORO- CARBONS',
  'sulfur-hexafluoride': 'SULFUR HEXAFLUORIDE',
  'methane': 'METHANE',
  'special-carbon-dioxide': 'BISMUTH',
  'special-nitrous-oxide': 'TITANIUM DIOXIDE',
  'special-hfc': 'TETRAFLUORO- PROPENE',
  'special-pfc': 'NICKEL OXIDE',
  'special-sulfur-hexafluoride': 'TRIFLUOROIODO- METHANE',
  'special-methane': 'ZEOLITES',
  'carbon-bomb': 'PIGOUVIAN TAX',
};

const NAME_TO_URL_MAP = {
  'carbon-dioxide': 'https://en.wikipedia.org/wiki/Carbon_dioxide_in_Earth%27s_atmosphere#Anthropogenic_CO2_emissions',
  'nitrous-oxide': 'https://en.wikipedia.org/wiki/Nitrous_oxide#Atmospheric_occurrence',
  'hfc': 'https://en.wikipedia.org/wiki/Hydrofluorocarbon#Environmental_Regulation',
  'pfc': 'https://en.wikipedia.org/wiki/Fluorocarbon#Environmental_and_health_concerns',
  'sulfur-hexafluoride': 'https://en.wikipedia.org/wiki/Sulfur_hexafluoride#Greenhouse_gas',
  'methane': 'https://en.wikipedia.org/wiki/Atmospheric_methane#Methane_as_a_greenhouse_gas',
  'special-carbon-dioxide': 'https://pubs.acs.org/doi/10.1021/acscatal.9b04043',
  'special-nitrous-oxide': 'https://pubs.acs.org/doi/10.1021/acs.jpcc.5b10631',
  'special-hfc': 'https://en.wikipedia.org/wiki/1,3,3,3-Tetrafluoropropene#Uses',
  'special-pfc': 'https://iopscience.iop.org/article/10.1088/1755-1315/27/1/012048/pdf',
  'special-sulfur-hexafluoride': 'https://hal.archives-ouvertes.fr/hal-01919350',
  'special-methane': 'https://en.wikipedia.org/wiki/Zeolite#Uses_of_zeolites',
  'carbon-bomb': 'https://en.wikipedia.org/wiki/Carbon_tax#Economic_theory',
};
  
function Achievements(props) {
  const { gameState, toggleSpecialAchievements, displaySpecialAchievements } = props;
  const achievementsColOne = [];
  const achievementsColTwo = [];
  const tokens = displaySpecialAchievements ? DEFAULT_TOKENS.specialTokens : DEFAULT_TOKENS.regularTokens;
  for (let i = 0; i < tokens.length; i++) {
    const tokenImagePath = TOKEN_TO_IMAGE_PATH_MAP[tokens[i]];
    const image = (
      <section className="achievement-container" key={tokens[i]}>
        <section className="achievement-image-container">
          <section className="achievement-label">
            <span><a href={NAME_TO_URL_MAP[tokens[i]]} target="_blank" rel="noreferrer">{TOKEN_TO_NAME_MAP[tokens[i]]}</a></span>
          </section>
          <img src={tokenImagePath} alt={TOKEN_TO_NAME_MAP[tokens[i]]}/>
          <section className="achievement-value">{`${gameState.getCaptureCount(tokens[i])}x`}</section>
        </section>

      </section>
    )
    if (i % 2 === 0) {
      achievementsColOne.push(image);
    }
    else {
      achievementsColTwo.push(image);
    }
  }
  return (
    <article className="achievements-container">
      <section className="achievements-header">
        <section className="achievements-title">Achievements</section>
        <section className="achievements-tabs">
          <button className="achievements-tab" onClick={() => toggleSpecialAchievements(false)}>REGULAR</button>
          <button className="achievements-tab" onClick={() => toggleSpecialAchievements(true)}>BONUS</button>
        </section>
      </section>
      <section className="achievements">
        <section className="achievements-table">
          <section className="achievements-col">
            {achievementsColOne}
          </section>
          <section className="achievements-col">
            {achievementsColTwo}
          </section>
        </section>
        <section className="achievement-container carbon-bomb">
        {displaySpecialAchievements && 
          <>
            <section className="achievement-image-container">
              <section className="achievement-label">
                <span><a href={NAME_TO_URL_MAP['carbon-bomb']} target="_blank" rel="noreferrer">{TOKEN_TO_NAME_MAP['carbon-bomb']}</a></span>
              </section>
              <img src={TOKEN_TO_IMAGE_PATH_MAP['carbon-bomb']} alt={TOKEN_TO_NAME_MAP['carbon-bomb']}/>
              <section className="achievement-value">{`${gameState.getCaptureCount('carbon-bomb')}x`}</section>
            </section>
            
          </>
          }
        </section>
       </section>
    </article>
  )
}

export default Achievements;