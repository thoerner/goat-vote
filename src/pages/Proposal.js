import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { getProposalById, vote, getVoteByAddress, getAllVotes } from '../utils/ddb'
import { shortenAddress, getEnsName } from '../utils/tools'
import { isMobile } from 'react-device-detect'
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import toast from 'react-hot-toast'

const addressToEns = async (address) => {
    const ensName = await getEnsName(address)
    if (!ensName) {
        return null
    } else {
        return ensName
    }
}

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
    const [ensNames, setEnsNames] = useState([])
    const [ensLoading, setEnsLoading] = useState(true)

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

    useEffect(() => {
        const getEnsNames = async () => {
            let sortedVotes = [...allVotes]

            // sort by number of votes
            sortedVotes.sort((a, b) => b.votes - a.votes)
            const names = []
            for (let i = 0; i < sortedVotes.length; i++) {
                const name = await addressToEns(sortedVotes[i].address)
                names.push(name)
            }
            setEnsNames(names)
            setEnsLoading(false)
        }
        if (allVotes.length > 0) {
            getEnsNames()
        }
    }, [allVotes])

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
            tallyText[option] = `${tally[option].toFixed(2)} (${(tally[option] / totalVotes * 100).toFixed(2)}%)`
        })

        const sorted = Object.keys(tally).sort((a, b) => tally[b] - tally[a])

        // return tallies as a table using MUI

        return (
            <div style={styles.centered}>
                <TableContainer sx={{ margin: "10px" }} component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell style={styles.th}>Option</TableCell>
                                <TableCell style={styles.th}>Votes</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Object.keys(tally).map((option, i) => (
                                <TableRow
                                    key={i}
                                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                    <TableCell style={i % 2 ? styles.td : styles.tda} component="th" scope="row">
                                        {option}
                                    </TableCell>
                                    <TableCell style={i % 2 ? styles.td : styles.tda}>{tallyText[option]}{sorted[0] === option ? ' ✅' : null }</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        )
    }

    const LoadingPlaceholder = () => {
        return (
            <div className="main-item">
                <div className="static-background">
                    <div className="animated-background"></div>
                </div>
            </div>
        )
    }

    // return a table of votes, by address, using MUI
    const TableOfVotes = () => {

        if (allVotes.length === 0) {
            return <div></div>
        }

        let sortedVotes = [...allVotes]

        // sort by number of votes
        sortedVotes.sort((a, b) => b.votes - a.votes)

        // how can i make every other row a different color?
        
        return (
            <div style={styles.centered}>
                <TableContainer sx={{maxWidth: "90vw", marginBottom: "100px"}} component={Paper}>
                    <Table aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell style={styles.th}>Address</TableCell>
                                <TableCell style={styles.th}>ENS</TableCell>
                                <TableCell style={styles.th}>Option</TableCell>
                                <TableCell style={styles.th}>Votes</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedVotes.map((vote, i) => (
                                <TableRow key={i}>
                                    <TableCell style={vote.address === props.walletAddress ? styles.tdx : i % 2 ? styles.td : styles.tda}><a href={`https://opensea.io/${vote.address}`} target="_blank" rel="noreferrer">{shortenAddress(vote.address)}</a></TableCell>
                                    <TableCell style={vote.address === props.walletAddress ? styles.tdx : i % 2 ? styles.td : styles.tda}>{ensLoading ? <LoadingPlaceholder/> : ensNames[i]}</TableCell>
                                    <TableCell style={vote.address === props.walletAddress ? styles.tdx : i % 2 ? styles.td : styles.tda}>{vote.option}</TableCell>
                                    <TableCell style={vote.address === props.walletAddress ? styles.tdx : i % 2 ? styles.td : styles.tda}>{Number(vote.votes).toFixed(2)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </div>
        )
    }

    // }


    return (
        <div style={styles.proposal}>
            {loading ? <div>Loading...</div> : <div>
            <h1>{proposal.proposal}</h1>
            <SelectableOptions 
                options={proposal.options} 
                setChosenOption={setChosenOption}
                chosenVote={chosenVote}
            />
            <button onClick={handleSubmit}>
                {proposal.active === "true" ? "Vote" : "🚫 Voting Inactive"}
            </button>
            <br />
            <br />
            <h2><u>Results</u></h2>
            <div style={styles.centered}>
                <VoteTally />
                <TableOfVotes />
            </div>
            </div>}
        </div>
    )
}

const styles = {
    loading: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
        fontSize: '20px',
        fontWeight: 'bold',
        padding: '10px',
        margin: '10px',
    },
    proposal: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    centered: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
    },
    table: {
        borderCollapse: 'collapse',
        border: '1px solid black',
        marginBottom: '100px'
    },
    th: {
        padding: '10px',
        border: '1px solid black',
        backgroundColor: '#111',
        color: 'white',
    },
    td: {
        border: '1px solid black',
        padding: '10px',
        backgroundColor: 'white',
        color: 'black',
        opacity: '0.8',
    },
    tda: {
        border: '1px solid black',
        padding: '10px',
        backgroundColor: 'lightgray',
        color: 'black',
        opacity: '0.8',
    },
    tdo: {
        border: '1px solid black',
        padding: '10px',
        backgroundColor: 'white',
        color: 'black',
        opacity: '0.8',
        minWidth: '75px'
    },
    tdx: {
        border: '1px solid black',
        padding: '10px',
        backgroundColor: 'green'
    },
    tdxo: {
        border: '1px solid black',
        padding: '10px',
        backgroundColor: 'green',
        minWidth: '75px'
    }
}

export default Proposal