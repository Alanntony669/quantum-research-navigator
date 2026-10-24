"""Category browsing routes."""

from fastapi import APIRouter

from schemas import Category

router = APIRouter(prefix="/api/categories", tags=["Categories"])

CATEGORIES: list[Category] = [
    Category(
        name="Quantum Computing",
        slug="quantum-computing",
        description="General quantum computing theory, architectures, and implementations.",
        arxiv_category="quant-ph",
    ),
    Category(
        name="Quantum Information",
        slug="quantum-information",
        description="Quantum information theory, entropy, and resource theories.",
        arxiv_category="quant-ph",
    ),
    Category(
        name="Quantum Cryptography",
        slug="quantum-cryptography",
        description="Quantum key distribution, post-quantum cryptography, and quantum-safe protocols.",
        arxiv_category="quant-ph",
    ),
    Category(
        name="Quantum Error Correction",
        slug="quantum-error-correction",
        description="Error-correcting codes, fault-tolerant computation, and noise mitigation techniques.",
        arxiv_category="quant-ph",
    ),
    Category(
        name="Quantum Machine Learning",
        slug="quantum-machine-learning",
        description="Intersection of quantum computing and machine learning, quantum neural networks.",
        arxiv_category="cs.QC",
    ),
    Category(
        name="Quantum Simulation",
        slug="quantum-simulation",
        description="Using quantum systems to simulate other quantum systems, molecular simulation.",
        arxiv_category="quant-ph",
    ),
    Category(
        name="Quantum Hardware",
        slug="quantum-hardware",
        description="Superconducting qubits, ion traps, photonic quantum computing, and other hardware platforms.",
        arxiv_category="quant-ph",
    ),
    Category(
        name="Quantum Algorithms",
        slug="quantum-algorithms",
        description="Design and analysis of algorithms for quantum computers.",
        arxiv_category="cs.QC",
    ),
    Category(
        name="Quantum Communication",
        slug="quantum-communication",
        description="Quantum networks, quantum internet, quantum repeaters, and teleportation protocols.",
        arxiv_category="quant-ph",
    ),
    Category(
        name="Quantum Sensing",
        slug="quantum-sensing",
        description="Using quantum effects for precision measurement, magnetometry, and imaging.",
        arxiv_category="quant-ph",
    ),
]


@router.get("", response_model=list[Category])
def list_categories():
    """Return all quantum research categories."""
    return CATEGORIES
