import { useEffect, useState } from 'react'
import './App.scss'
import Card from './components/Card'


// maker of imgur url string
const makeImgurStr = (id: string): string => {
  return 'https://i.imgur.com/' + id + '.jpeg'
}

//  this the default image of the card
const CardBackDefault_array:string[] = [
  'miu7iv4',
  'z7MDnKu',
  'jKIgFkO',
  'q9Rj5Pq',
  'mYM0HBn',
  'a8eIFj7',
  'uwCi1Vq',
  'taW0cYL',
  'v3N6Jpc',
  // 'htyq4QF',
  // 'OBb9MAP',
  'W463cuz',
  'Gh7ORYQ',
  'MvE8oPW',
  // 'OeqF6i7', 'LhpcDwF'
]

//  shuffle default card collection (FYN algo)
const shuffle_fisher_yates = (arr: { src: string }[]): { src: string }[] => {
  arr.sort(() => Math.random() - .5)
  return arr
}

//  default card collection
const readLinesFromInfile = async (): Promise<{ src: string }[]> => {
  try {
    const repo: string = 'https://raw.githubusercontent.com/nuoxoxo/in/main/'
    let filepaths = Array.from({ length: 7 }, (_, idx) => 
      `${repo}limited_edition_0${idx + 1}.in`
    )
    filepaths = [
      ... filepaths,
      repo + 'canciones.json',
      repo + 'canciones_edition_jazz.json'
    ]
    const TEMP: { src: string }[] = []
    for (const filepath of filepaths) {
      const response = await fetch (filepath)
      if (!response.ok) throw new Error('failed fecthing')
      const data: Record<string, { cover: string }> = await response.json()
      const lines = Object.values(data).map(({ cover }) => cover)
      const temp = lines.map((line) => ({ src: line }))
      temp.forEach((item) => {
        if (!TEMP.some(existingItem => existingItem.src === item.src)) {
          TEMP.push(item);
        }
      })
    }
    // console.log(TEMP)
    return TEMP
  } catch (err) {
    console.error(err)
    return []
  }
}

const App = () => {

  const [ CardsImgSrc, setCardsImgSrc ] = useState<{ src: string }[]>([])
  const [ DuringFlip, setDuringFlip ] = useState<boolean>(false)
  const [ CardBack, setCardBack ] = useState<string>('')

  const [ Cards, setCards ] = useState<{
    src: string;
    id: number;
    url: string;
    matched: boolean
  }[]>([])

  const [ g1, setg1 ] = useState<{
    src: string;
    id: number;
    url: string;
    matched: boolean
  } | null>( null )

  const [ g2, setg2 ] = useState<{
    src: string;
    id: number;
    url: string;
    matched: boolean
  } | null>( null )

  //  determin default card back pattern
  const get_card_back = (): string => {
    return makeImgurStr( CardBackDefault_array [
      Math.floor(Math.random() * CardBackDefault_array.length)
    ]
  )}

  useEffect(() => {
    // Call the function to read lines when the component mounts
    readLinesFromInfile().then((arr: { src: string }[]) => {
      setCardsImgSrc(arr)
    })
    setCardBack(get_card_back())
  }, [])

  const N = 12
  const CardsImgN = shuffle_fisher_yates([ ... CardsImgSrc]).slice(0, N)

  // double each item and shuffle
  const shuffle_matching_pairs = () => {
    const res = [...CardsImgN, ...CardsImgN]
      .sort(() => Math.random() - .5)
      .map( (c) => ({
        ...c, 
        src: c.src,
        id: Math.random(),
        url: makeImgurStr(c.src),
        matched : false
      }))
    setCards( res )
    setg1 (null)
    setg2 (null)
  }

  // handle guessing
  const handleGuessing = (c: {
    src: string;
    id: number;
    url: string;
    matched: boolean
  }): void => {

    g1 == null ? setg1( c ) : setg2( c )
    // console.log('/guessed', c.src, c.id ) // DBG
    // 👇 won't log bc. not finished updating the state ---> should use useEffect
    // console.log('/state/in handler', g1, g2 )
  }

  const reset = () => {

    setg1(null)
    setg2(null)
    setTimeout(() => setDuringFlip (false), 100)
  }

  const handleNewGame = (): void => {
    setCardBack(get_card_back())
    shuffle_matching_pairs()
  }

  // game starts onload
  useEffect (() => {
    shuffle_matching_pairs()
    setg1(null)
    setg2(null)
  }, [ CardsImgSrc, CardBack ]) // Bugfix :: auto-start game onload

  useEffect(() => {

    if ( g1 && g2 ) {
      setDuringFlip( true )
      if (g1.src == g2.src) {
        // console.log('/Same') // DBG
        setCards ( arr => {
          return arr.map(c => {
            if ( c.src === g1.src ) {
              return { ... c, matched: true  }
            } else {
              return c
            }
          })
        })
        reset ()
      } else {
        // console.log('/Diff') // DBG
        setTimeout(() => reset (), 500)
        // needs timeout otherwise 2nd card wont flip
      }
    }
  }, [g1, g2, Cards])

  // console.log(Cards) // DBG

  return (
    <>
      <div className='App'>
        {/* <h1> hello, world! </h1> */}
        <div className='btn'>
          <button onClick={ handleNewGame/*shuffle_matching_pairs*/ }>New Game</button>
        </div>

        {/*  NEW  */}
        {/* <div className='timer'>Timer: {timer} seconds</div> */}

        <div className='cards-grid'>

          {/* NEW way : functional component*/}
          {Cards.map( c => (
            <Card
              c={c}
              key={c.id}
              handleGuessing={handleGuessing}
              flipped={c.matched || c.id === g1?.id || c.id === g2?.id}
              CardBackDefault={CardBack/*Default*/}
              DuringFlip={DuringFlip}
            />
          ))}

          {/* old way */}
          {/*
          {Cards.map(c => (
            <div key={c.id} className='cards-card-div'>
              <img className='cards-card cards-card-back' src={CardBackDefault}/>
              <img className='cards-card cards=card-front' src={c.url} />
            </div>
          ))}
          */}

        </div>
      </div>
    </>
  )
}

export default App
