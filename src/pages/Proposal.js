import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getProposalById, vote, getVoteByAddress, getAllVotes } from '../utils/ddb'
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

    useEffect(() => {
        const getData = async () => {
            if (proposalId === "") {
                return
            }
            const item = await getProposalById(proposalId)
            setProposal(item)
            const votes = await getAllVotes(proposalId)
            setAllVotes(votes)
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
            toast.error('This vote is not active!')
            return
        }
        if (Number(props.votes) === 0) {
            toast.error('You have no votes!')
            return
        }
        if (chosenOption === -1) {
            console.log("Error")
            return
        }
        const { success } = await vote(id, props.walletAddress, proposal.options[chosenOption], props.votes)
        if (success) {
            toast.success('Vote submitted!')
            setVote(proposal.options[chosenOption])
            setSubmitted(true)
        } else {
            console.log("Error")
            toast.error('Vote failed!')
        }
    }

    const tallyVotes = () => {
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

        // calculate percentages
        Object.keys(tally).forEach(option => {
            tally[option] = `${tally[option]} (${(tally[option] / totalVotes * 100).toFixed(2)}%)`
        })

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
                                <td style={styles.td}>{tally[option]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }

    // return a full table of votes, by address
    const tableOfVotes = () => {
        
        if (allVotes.length === 0) {
            return <div></div>
        }

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
                        {allVotes.map((vote, i) => (
                            <tr key={i}>
                                <td style={styles.td}>{vote.address}</td>
                                <td style={styles.td}>{vote.option}</td>
                                <td style={styles.td}>{vote.votes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )

    }


    return (
        <div>
            <h1>{proposal.proposal}</h1>
            <SelectableOptions 
                options={proposal.options} 
                setChosenOption={setChosenOption}
                chosenVote={chosenVote}
            />
            <button onClick={handleSubmit}>{proposal.active === "true" ? "Vote (Voat?)" : "🚫 Voting Inactive"}</button>
            <br />
            <br />
            <h2><u>Results</u></h2>
            {tallyVotes()}
            {tableOfVotes()}

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
        padding: '5px'
    },
    td: {
        border: '1px solid black',
        padding: '5px'
    }
}

export default Proposal