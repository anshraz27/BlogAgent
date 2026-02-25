from langgraph.graph import StateGraph, START, END
from states.schemas import *
from nodes.node import *


def build_graph():
    g = StateGraph(State)
    g.add_node("router", router_node)
    g.add_node("research", research_node)
    g.add_node("orchestrator", orchestrator_node)
    g.add_node("generate_sections", generate_sections_node)
    g.add_node("merge_content", merge_content)
    g.add_node("decide_images", decide_images)
    g.add_node("generate_and_place_images", generate_and_place_images)

    g.add_edge(START, "router")
    g.add_conditional_edges(
        "router",
        route_next,
        {
            "research": "research",
            "orchestrator": "orchestrator",
        },
    )

    g.add_edge("research", "orchestrator")
    g.add_edge("orchestrator", "generate_sections")
    g.add_edge("generate_sections", "merge_content")
    g.add_edge("merge_content", "decide_images")
    g.add_edge("decide_images", "generate_and_place_images")
    g.add_edge("generate_and_place_images", END)

    return g.compile()
