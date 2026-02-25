from langgraph.graph import StateGraph, START, END
from states.schemas import *

def merge_content(state: State):
    ordered = [md for _, md in sorted(state["sections"])]
    return {"merged_md": "\n\n".join(ordered)}

def decide_images(state: State):
    return {"md_with_placeholders": state["merged_md"], "image_specs": []}

def generate_and_place_images(state: State):
    return {"final": state["md_with_placeholders"]}

def build_reducer():
    g = StateGraph(State)
    g.add_node("merge_content", merge_content)
    g.add_node("decide_images", decide_images)
    g.add_node("generate_and_place_images", generate_and_place_images)

    g.add_edge(START, "merge_content")
    g.add_edge("merge_content", "decide_images")
    g.add_edge("decide_images", "generate_and_place_images")
    g.add_edge("generate_and_place_images", END)

    return g.compile()
