import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getAllProposals } from '../utils/ddb'

const ViewProposals = () => {
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(false)

    const handleGetProposals = async () => {
        setLoading(true)
        const data = await getAllProposals()
        setProposals(data)
        setLoading(false)
    }

    useEffect(() => {
        handleGetProposals()
    }, [])

    return (
        <div>
            {loading && <p>Loading...</p>}
            {!loading && <div style={styles.proposalsContainer}>{proposals.map((proposal, i) => (
                <div style={styles.proposal} key={i}>
                    <div style={styles.proposalItem}>
                        <p><strong>Proposal:</strong>
                            <br/><br/>
                            {proposal['proposal']}
                        </p>
                    </div>
                    <div style={styles.proposalItem}>
                        <strong>Options:</strong>
                        <ul>
                            {proposal['options'].map((option, i) => (
                                <li key={i}>{option}</li>
                            ))}
                        </ul>
                    </div>
                    <Link to={`/proposal/${proposal['proposal-id']}`}>Go To Proposal</Link>
                    <br />
                    <br />
                </div>
            ))}</div>}
        </div>
    )
}


const Main = props => {
    const goatBalance = props.balance.goatBalance
    const stakedGoatBalance = props.balance.stakedGoatBalance
    return (
        <div>
            <h1>Goat Vote</h1>
            <p>Vote with your Goat Gauds!</p>
            <p>Goats: {goatBalance}</p>
            <p>Staked Goats: {stakedGoatBalance}</p>
            <p>Voting Power:{" "} 
                {props.votes}
            </p>
            {props.walletAddress !== "" &&
                <ViewProposals />
            }
        </div>
    )
}

const styles = {
    centered: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
    },
    proposal: {
        border: "1px solid black",
        padding: "10px",
        margin: "10px",
        borderRadius: "5px",
        maxWidth: "500px",
        backgroundColor: "gray",
        color: "black"
    },
    proposalsContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
    },
    proposalItem: {
        border: "1px solid black",
        padding: "10px",
        margin: "10px",
        borderRadius: "5px",
        textAlign: "left",
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
        color: "white",
        backgroundColor: "black"
    }
}

export default Main