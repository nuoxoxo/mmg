import './Card.scss'

const Card = ({ c, flipped, handleGuessing, CardBackDefault, DuringFlip, } : {
  c: { src: string; id: number; url: string; matched: boolean}
  handleGuessing: (c: {src: string; id: number; url: string; matched: boolean}) => void
  flipped: boolean
  DuringFlip: boolean
  CardBackDefault: string
}) =>  {

  const handleClick = () => {
    if ( DuringFlip ) return
    console.log(c.url)
    handleGuessing( c )
  }

  return (
    <div key={c.id} className='cards-card-div'>
      <div className={flipped ? 'flipped' : ''}>
        <img className='cards-card cards-card-back' src={ c.url }/>
        <img className='cards-card cards-card-front' src={CardBackDefault}
          onClick={ handleClick }
        />
      </div>
    </div>
  )
}

export default Card