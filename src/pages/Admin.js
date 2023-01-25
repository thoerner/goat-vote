import { useState } from 'react'
import { Link } from 'react-router-dom'
import { addNewProposal, getAllProposals, removeProposalById, setVoteActive, setVoteInactive } from '../utils/ddb'
import toast from 'react-hot-toast'

const SubmitButton = ({ proposal, options, setProposalId, proposalId, setProposal, setOptions }) => {

    const handleSubmit = async () => {
        if (!proposal || !options[0]) {
            toast("Please fill out all fields", { icon: "🚫" })
            console.log("Error")
            return
        }
        const { success, data } = await addNewProposal(proposal, options)
        if (success) {
            setProposalId(data)
            //clear form
            setProposal("")
            setOptions([])
        } else {
            console.log("Error")
        }
    }

    return (
        <div>
            <button onClick={handleSubmit}>Submit</button>
            <br />
            {proposalId && <p>Proposal ID: {proposalId}</p>}
        </div>
    )
}

const ProposalInput = () => {
    const [proposal, setProposal] = useState("")
    const [options, setOptions] = useState([])
    const [proposalId, setProposalId] = useState("")

    const handleProposalChange = (e) => {
        setProposal(e.target.value)
    }

    const handleOptionChange = (e, i) => {
        const newOptions = [...options]
        newOptions[i] = e.target.value
        setOptions(newOptions)
    }

    const handleRemoveOptions = (i) => {
        const newOptions = [...options]
        newOptions.splice(i, 1)
        setOptions(newOptions)
    }

    

    return (
        <div style={styles.proposalsContainer}>
            <div style={styles.proposal}>
                <h3>Add a Proposal</h3>
                <label>
                    <textarea value={proposal} rows="5" cols="50" onChange={handleProposalChange} />
                </label>
                <br />
                <br />
                {options.map((option, i) => (
                    <div key={i}>
                        <label>
                            Option {i+1}:{" "}
                            <input type="text" value={option} onChange={(e) => handleOptionChange(e, i)} />
                        </label>
                        {" "}<button onClick={() => handleRemoveOptions(i)}>Remove</button>
                        <br/>
                        <br/>
                    </div>
                ))}
                <button onClick={() => setOptions([...options, ""])}>Add Option</button>
                <br/>
                <br/>
                <SubmitButton
                    proposal={proposal}
                    options={options}
                    setProposalId={setProposalId}
                    proposalId={proposalId}
                    setProposal={setProposal}
                    setOptions={setOptions}
                />
            </div>
        </div>
    )
}

const ViewProposals = () => {
    const [proposals, setProposals] = useState([])
    const [loading, setLoading] = useState(false)

    const areYouSure = () => {
        return window.confirm("Are you sure you want to remove this proposal?")
    }
    
    const handleRemoveProposal = async (id) => {
        if (!areYouSure()) {
            return
        }
        const { success, error } = await removeProposalById(id)
        if (success) {
            toast.success("Proposal removed")
            setTimeout(() => {
                handleGetProposals()
            }, 1000)
        } else {
            console.log(error)
        }
    }

    const handleSetActive = async (id) => {
        const { success } = await setVoteActive(id)
        if (success) {
            toast.success("Vote is now active")
            handleGetProposals()
        } else {
            toast.error("Error")
        }
    }

    const handleSetInactive = async (id) => {
        const { success } = await setVoteInactive(id)
        if (success) {
            toast.success("Vote is now inactive")
            handleGetProposals()
        } else {
            toast.error("Error")
        }
    }

    const handleGetProposals = async () => {
        setLoading(true)
        const data = await getAllProposals()
        setProposals(data)
        setLoading(false)
    }

    return (
        <div>
            <h3>View Proposals</h3>
            <button onClick={handleGetProposals}>Get Proposals</button>
            <br />
            <br />
            {loading && <p>Loading...</p>}
            {!loading && <div style={styles.proposalsContainer}>{proposals.map((proposal, i) => (
                <div style={styles.proposal} key={i}>
                    <p><strong>ID:</strong> {proposal['proposal-id']}</p>
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
                    <div style={styles.proposalItem}>
                        <p><strong>Active:</strong> {proposal['active'] === "true" ? "Yes" : "No" }</p>
                    </div>
                    <button style={styles.removeButton} onClick={() => handleRemoveProposal(proposal['proposal-id'])}>Delete</button>
                    {" "}<button style={styles.deactivateButton} onClick={() => handleSetInactive(proposal['proposal-id'])}>Deactivate</button>
                    {" "}<button style={styles.activateButton} onClick={() => handleSetActive(proposal['proposal-id'])}>Activate</button>
                    <br />
                    <br />
                    <Link to={`/proposal/${proposal['proposal-id']}`}>Go To Proposal</Link>
                    <br />
                    <br />
                </div>
            ))}</div>}
        </div>
    )
}


const Admin = props => {
    return (
        <div>
            <h1>Admin</h1>
            <p style={{width: "50vw"}}>
                We can add proposals and stuff here.
                <br/> 
                <span style={{fontSize: "0.5em"}}>Technically anyone can add proposals. We just won't tell them.</span>
                <br/>
                Security through obscurity, ftw!
                <br/>
                <span style={{fontSize: "0.75em"}}>(jk, we'll fix this later)</span>
            </p>
            <ProposalInput />
            <ViewProposals />
        </div>
    )
}

const styles = {
    removeButton: {
        backgroundColor: 'red',
        color: 'white',
        cursor: 'pointer',
    },
    activateButton: {
        backgroundColor: 'green',
        color: 'white',
        cursor: 'pointer',
    },
    deactivateButton: {
        backgroundColor: 'yellow',
        color: 'black',
        cursor: 'pointer',
    },
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

export default Admin