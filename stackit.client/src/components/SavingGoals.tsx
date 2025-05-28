import { useEffect, useState } from 'react';
import { Card, ListGroup, Button, Modal, Form } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import '../i18n';
import { FaTrash } from 'react-icons/fa';

interface Goal {
    id?: number;
    label: string;
    amount: number;
    dueMonth: string;
    progression: number;
    remaining: number;
}

interface Props {
    goals: Goal[];
    setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
}

const formatForInput = (dateStr: string) => {
    // "2025-06-01" => "2025-06"
    return dateStr.slice(0, 7);
};

const formatForServer = (monthStr: string) => {
    // "2025-06" => "2025-06-01"
    return `${monthStr}-01`;
};

const formatForLabel = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(`${year}-${month}-01`);

    return date.toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
    });
};


function SavingGoals({ goals, setGoals }: Props) {
    const { t } = useTranslation();  // t per tradurre, i18n per gestire la lingua
    const todayStr = new Date().toISOString().slice(0, 7); 

    const [showModal, setShowModal] = useState(false);

    const [savingGoal, setSavingGoal] = useState<Goal>({
        label:"",
        amount: 0,
        dueMonth: `${todayStr}-01`,
        progression: 0,
        remaining: 0
    });

    //const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchGoals = async (retries = 5, delayMs = 1000) => {
        try {
            setLoading(true);
            const response = await fetch('savinggoals');
            if (!response.ok) throw new Error('Errore nel caricamento obiettivi');

            const data: Goal[] = await response.json();
            setGoals(data);
            setLoading(false);
        } catch (err) {
            if (retries > 0) {
                console.warn(`Tentativo fallito, riprovo tra ${delayMs}ms... (${retries} tentativi rimasti)`);
                setTimeout(() => fetchGoals(retries - 1, delayMs * 2), delayMs);
            } else {
                setError((err as Error).message);
                setLoading(false);
            }
        }
    };

    // Aggiungi un nuovo obiettivo (POST)
    const addGoal = async () => {
        try {
            console.log(savingGoal)
            const response = await fetch('savinggoals', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(savingGoal),
            });
            console.log(response)
            if (!response.ok) throw new Error('Errore nell\'aggiunta dell\'obiettivo');

            setSavingGoal({
                label: '',
                amount: 0,
                dueMonth: `${todayStr}-01`,
                progression: 0,
                remaining: 0
            });

            setShowModal(false);
            fetchGoals();
        } catch (err) {
            alert((err as Error).message);
        }
    };

    const deleteGoal = async (id?: number) => {
    if (!id) return;

    try {
        const response = await fetch(`savinggoals/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Errore durante l\'eliminazione');

        fetchGoals();
    } catch (err) {
        alert((err as Error).message);
    }
};

    useEffect(() => {
        fetchGoals();
    }, []);

    if (loading) return <div>{t('loading')}</div>;
    if (error) return <div>{t('error')}: {error}</div>;

    return (
        <>
            <Card className="m-4" style={{ border: '1px solid #ccc' }}>
                <Card.Header as="h5">
                    {t('savingGoals')}
                    <Button
                        variant="success"
                        size="sm"
                        className="float-end"
                        onClick={() => setShowModal(true)}
                    >
                        + {t('addGoal')}
                    </Button>
                </Card.Header>
                <ListGroup variant="flush">
                    {goals.map((goal) => (
                        <ListGroup.Item
                            key={goal.id}
                            className="d-flex justify-content-between align-items-center"
                        >
                            <div className="me-3">
                                <div className="fw-bold">{goal.label}</div>
                                <div>
                                    {goal.amount.toLocaleString('it-IT', {
                                        style: 'currency',
                                        currency: 'EUR',
                                    })}{' '}
                                    {t('by')} {formatForLabel(formatForInput(goal.dueMonth))}
                                </div>
                            </div>
                            <Button
                                variant="danger"
                                size="lg"
                                onClick={() => deleteGoal(goal.id)}
                                title={t('delete')}
                                style={{ padding: '0.25rem 0.5rem', minWidth: '40px' }}
                            >
                                <FaTrash color="black" size={18} />
                            </Button>
                        </ListGroup.Item>
                    ))}
                </ListGroup>


            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>Aggiungi nuovo obiettivo</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formAmount">
                            <Form.Label>{t('goalName')}</Form.Label>
                            <Form.Control
                                type="text"
                                value={savingGoal.label}
                                placeholder="Es. Viaggio, Computer..."
                                onChange={(e) =>
                                    setSavingGoal({ ...savingGoal, label: e.target.value })
                                }
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formAmount">
                            <Form.Label>{t('goalAmount')}</Form.Label>
                            <Form.Control
                                type="number"
                                value={isNaN(savingGoal.amount) ? '' : savingGoal.amount}
                                placeholder="Inserisci importo"
                                min={0}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setSavingGoal({
                                        ...savingGoal,
                                        amount: value === '' ? 0 : parseFloat(value)
                                    });
                                }}

                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formDueMonth">
                            <Form.Label>{t('goalDueDate')}</Form.Label>
                            <Form.Control
                                type="month"
                                value={formatForInput(savingGoal.dueMonth)}
                                onChange={(e) =>
                                    setSavingGoal({ ...savingGoal, dueMonth: formatForServer(e.target.value) })
                                }
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        {t('cancel')}
                    </Button>
                    <Button variant="primary" onClick={addGoal}>
                        {t('save')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default SavingGoals;
