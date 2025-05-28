import React, { useEffect, useState } from 'react';
import { Card, Button, Modal, Form, Table } from 'react-bootstrap';
import { FaTrash } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface Balance {
    id?: number;
    month: string; // formato "2025-06"
    balance: number;
}

interface Props {
    balances: Balance[];
    setBalances: React.Dispatch<React.SetStateAction<Balance[]>>;
}

const formatForLabel = (monthStr: string) => {
    const [year, month] = monthStr.split("-");
    const date = new Date(`${year}-${month}-01`);

    return date.toLocaleDateString("it-IT", {
        year: "numeric",
        month: "long",
    });
};

const formatForInput = (dateStr: string) => {
    // "2025-06-01" => "2025-06"
    return dateStr.slice(0, 7);
};

const formatForServer = (monthStr: string) => {
    // "2025-06" => "2025-06-01"
    return `${monthStr}-01`;
};

function MonthlyBalanceComponent({ balances, setBalances }: Props) {
    const { t } = useTranslation();
    const todayStr = new Date().toISOString().slice(0, 7); 

    //const [balances, setBalances] = useState<MonthlyBalance[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [newBalance, setNewBalance] = useState<Balance>({
        month: `${todayStr}-01`,
        balance: 0
    });

    const fetchBalances = async (retries = 5, delayMs = 1000) => {
        try {
            setLoading(true);
            const response = await fetch('monthlybalances');
            if (!response.ok) throw new Error('Errore nel caricamento dei saldi mensili');

            const data: Balance[] = await response.json();
            setBalances(data);
            setLoading(false);
        } catch (err) {
            if (retries > 0) {
                console.warn(`Tentativo fallito, riprovo tra ${delayMs}ms... (${retries} tentativi rimasti)`);
                setTimeout(() => fetchBalances(retries - 1, delayMs * 2), delayMs);
            } else {
                setError((err as Error).message);
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        fetchBalances();
    }, []);

    // Aggiungi un nuovo obiettivo (POST)
    const addBalance = async () => {
        try {
            console.log(newBalance)
            const response = await fetch('monthlybalances', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newBalance),
            });
            console.log(response)
            if (!response.ok) throw new Error('Errore nell\'aggiunta dell\'obiettivo');

            setNewBalance({
                month: `${todayStr}-01`,
                balance: 0
            });

            setShowModal(false);
            fetchBalances();
        } catch (err) {
            alert((err as Error).message);
        }
    };

    // Funzione per eliminare un balance
    const deleteBalance = async (id?: number) => {
        if (!id) return; // se non c'è id, esci

        if (!window.confirm(t('confirmDelete'))) return; // chiedi conferma

        try {
            const response = await fetch(`monthlybalances/${id}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error(t('errorDeleting'));

            fetchBalances(); // aggiorna la lista dopo la cancellazione
        } catch (err) {
            alert((err as Error).message);
        }
    };

    if (loading) return <div>{t('loading')}</div>;
    if (error) return <div>{t('error')}: {error}</div>;

    return (
        <>
            <Card className="m-4">
                <Card.Header as="h5">
                    {t('monthlyBalance')}
                    <Button
                        variant="success"
                        size="sm"
                        className="float-end"
                        onClick={() => setShowModal(true)}
                    >
                        + {t('addBalance')}
                    </Button>
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th>{t('month')}</th>
                                <th>{t('balance')} (€)</th>
                                <th>{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {balances.map(({ id, month, balance }) => {
                                return (
                                    <tr key={id}>
                                        <td>{formatForLabel(month)}</td>
                                        <td>{balance.toLocaleString('it-IT')}</td>
                                        <td style={{ width: '60px', textAlign: 'center', padding: '0.3rem' }}>
                                            <Button
                                                variant="danger"
                                                size="lg"
                                                onClick={() => deleteBalance(id)}
                                                title={t('delete')}
                                                style={{ padding: '0.25rem 0.5rem', minWidth: '40px' }}
                                            >
                                                <FaTrash color="black" size={18} />
                                            </Button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title>{t('addMonthlyBalance')}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form>
                        <Form.Group className="mb-3" controlId="formMonth">
                            <Form.Label>{t('month')}</Form.Label>
                            <Form.Control
                                type="month"
                                value={formatForInput(newBalance.month)}
                                onChange={(e) =>
                                    setNewBalance({ ...newBalance, month: formatForServer(e.target.value) })
                                }
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="formBalance">
                            <Form.Label>{t('balance')}</Form.Label>
                            <Form.Control
                                type="number"
                                value={newBalance.balance}
                                min={0}
                                onChange={e => setNewBalance({ ...newBalance, balance: parseFloat(e.target.value) || 0 })}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowModal(false)}>
                        {t('cancel')}
                    </Button>
                    <Button variant="primary" onClick={addBalance}>
                        {t('save')}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
}

export default MonthlyBalanceComponent;
