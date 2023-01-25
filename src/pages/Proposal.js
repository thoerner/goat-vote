import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getProposalById, vote, getVoteByAddress, getAllVotes } from '../utils/ddb'
import { getEnsName } from '../utils/interact'
import toast from 'react-hot-toast'

const SelectableOptions = ({ options, setChosenOption, chosenVote }) => {    
    const handleOptionChange = (e, i) => {
        setChosenOption(i)
    }

    if (!options) {
        return <div></div>
    }

    return (
        <div>
            {options.map((option, i) => (
                <div key={i}>
                    <label>
                        {chosenVote === options[i] ? <span>✅{" " + options[i]}</span> : options[i]}
                        <input type="radio" name="option" value={option} onChange={(e) => handleOptionChange(e, i)} />
                    </label>
                    <br/>
                    <br/>
                </div>
            ))}
        </div>
    )
}

const Proposal = props => {
    const { id } = useParams()
    const [proposal, setProposal] = useState({})
    const [chosenOption, setChosenOption] = useState(-1)
    const [chosenVote, setVote] = useState('')
    const [allVotes, setAllVotes] = useState([])
    const [submitted, setSubmitted] = useState(false)
    const [proposalId, setProposalId] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const getData = async () => {
            if (proposalId === "") {
                return
            }
            const item = await getProposalById(proposalId)
            setProposal(item)
            const votes = await getAllVotes(proposalId)
            setAllVotes(votes)
            setLoading(false)
        }
        getData()
    }, [proposalId])

    useEffect(() => {
        setProposalId(id)
    }, [id])

    useEffect(() => {
        const getVote = async () => {
            if (props.walletAddress === "" || proposalId === "") {
                return
            }
            const vote = await getVoteByAddress(proposalId, props.walletAddress)
            setVote(vote)
        }
        getVote()
    }, [chosenOption, proposal, props.walletAddress, proposalId])

    useEffect(() => {
        const getData = async () => {
            if (proposalId === "") {
                return
            }
            const votes = await getAllVotes(proposalId)
            setAllVotes(votes)
        }
        if (submitted) {
            setSubmitted(false)
            getData()
        }
    }, [submitted, allVotes, proposalId])

    const handleSubmit = async () => {
        if (proposal.active === "false") {
            toast.error(`It's not time to vote!`)
            return
        }
        if (Number(props.votes) === 0) {
            toast.error('You have no power!')
            return
        }
        if (chosenOption === -1) {
            toast.error('You must choose an option!')
            return
        }
        const { success, error } = await vote(id, props.walletAddress, proposal.options[chosenOption], props.votes)
        if (success) {
            toast.success('Vote submitted!')
            setVote(proposal.options[chosenOption])
            setSubmitted(true)
        } else {
            toast.error('Vote failed:', error)
            console.log(error)
        }
    }

    const VoteTally = () => {
        const tally = {}
        allVotes.forEach(vote => {
            if (!tally[vote.option]) {
                tally[vote.option] = 0
            }
            tally[vote.option] += Number(vote.votes)
        })

        // calculate total votes
        let totalVotes = 0
        Object.keys(tally).forEach(option => {
            totalVotes += tally[option]
        })

        const tallyText = {...tally}

        // calculate percentages
        Object.keys(tally).forEach(option => {
            tallyText[option] = `${tally[option]} (${(tally[option] / totalVotes * 100).toFixed(2)}%)`
        })

        const sorted = Object.keys(tally).sort((a, b) => tally[b] - tally[a])

        return (
            <div style={styles.centered}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Option</th>
                            <th style={styles.th}>Votes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.keys(tally).map((option, i) => (
                            <tr key={i}>
                                <td style={styles.td}>{option}</td>
                                <td style={styles.td}>{tallyText[option]}{sorted[0] === option ? ' ✅' : null }</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    // return a full table of votes, by address
    const TableOfVotes = () => {
        
        if (allVotes.length === 0) {
            return <div></div>
        }

        let sortedVotes = [...allVotes]

        // sort by number of votes
        sortedVotes.sort((a, b) => b.votes - a.votes)


        return (
            <div style={styles.centered}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>Address</th>
                            <th style={styles.th}>Option</th>
                            <th style={styles.th}>Votes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedVotes.map((vote, i) => (
                            <tr key={i}>
                                <td style={vote.address === props.walletAddress ? styles.tdx : styles.td}><a href={`https://opensea.io/${vote.address}`} target="_blank" rel="noreferrer">{vote.address}</a></td>
                                <td style={vote.address === props.walletAddress ? styles.tdx : styles.td}>{vote.option}</td>
                                <td style={vote.address === props.walletAddress ? styles.tdx : styles.td}>{vote.votes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )

    }


    return (
        <div>
            {loading ? <div>Loading...</div> : <div>
            <h1>{proposal.proposal}</h1>
            <SelectableOptions 
                options={proposal.options} 
                setChosenOption={setChosenOption}
                chosenVote={chosenVote}
            />
            <button onClick={handleSubmit}>
                {proposal.active === "true" ? "Vote (Voat?)" : "🚫 Voting Inactive"}
            </button>
            <br />
            <br />
            <h2><u>Results</u></h2>
            <VoteTally />
            <TableOfVotes />
            </div>}
        </div>
    )
}

const styles = {
    centered: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    table: {
        borderCollapse: 'collapse',
        border: '1px solid black',
        marginBottom: '100px'
    },
    th: {
        border: '1px solid black',
        padding: '10px',
        backgroundColor: 'lightgrey',
        opacity: '0.6',
        color: 'black'
    },
    td: {
        border: '1px solid black',
        padding: '10px',
        backgroundColor: 'white',
        color: 'black',
        opacity: '0.8'
    },
    tdx: {
        border: '1px solid black',
        padding: '10px',
        backgroundColor: 'green'
    }
}

export default Proposal