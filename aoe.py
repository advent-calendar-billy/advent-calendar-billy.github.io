import networkx as nx
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import os

def create_aoe_network(save_path='aoe_unit_counters_complete.png', show_plot=True):
    # Create a new directed graph
    G = nx.DiGraph()

    # Define unit categories and their colors
    UNIT_CATEGORIES = {
        'infantry': {
            'units': ['Militia-line', 'Spearmen', 'Eagles', 'Berserks', 'Samurai', 
                     'Teutonic Knights', 'Woad Raiders', 'Huskarls', 'Jaguar Warriors', 
                     'Throwing Axemen'],
            'color': '#e6194B'  # Bright Red
        },
        'cavalry': {
            'units': ['Knights', 'Light Cavalry', 'Cataphract', 'Elite Cataphract',
                     'Camels', 'Heavy Camels', 'Mamelukes', 'Elite Mamelukes',
                     'War Elephants'],
            'color': '#3cb44b'  # Bright Green
        },
        'archer': {
            'units': ['Foot Archers', 'Archers', 'Crossbowmen', 'Arbalests', 
                     'Cavalry Archers', 'Skirmishers', 'Elite Skirmishers', 
                     'Hand Cannoneers', 'Plumed Archers', 'Elite Plumed Archers', 
                     'Mangudai', 'Chu Ko Nu', 'Longbowmen', 'Janissaries', 
                     'Elite Janissaries', 'Conquistadors', 'Elite Conquistadors', 
                     'War Wagons', 'Elite War Wagons'],
            'color': '#4363d8'  # Bright Blue
        },
        'siege': {
            'units': ['Battering Rams', 'Capped Rams', 'Siege Rams',
                     'Bombard Cannons', 'Scorpions', 'Heavy Scorpions',
                     'Watch Towers', 'Guard Towers', 'Keeps', 'Bombard Towers'],
            'color': '#f58231'  # Bright Orange
        },
        'naval': {
            'units': ['Galleys', 'War Galleys', 'Galleons',
                     'Fire Ships', 'Fast Fire Ships',
                     'Demolition Ships', 'Heavy Demolition Ships',
                     'Cannon Galleons', 'Elite Cannon Galleons',
                     'Longboats', 'Elite Longboats'],
            'color': '#42d4f4'  # Bright Cyan
        },
        'buildings': {
            'units': ['Buildings', 'Stone Defenses', 'Castles', 'Walls', 'Gates'],
            'color': '#e6b800'  # Golden
        },
        'other': {
            'units': ['Monks', 'Missionaries', 'Villagers'],
            'color': '#911eb4'  # Bright Purple
        }
    }

    # Create a mapping of units to their colors
    node_color_map = {}
    for category, data in UNIT_CATEGORIES.items():
        for unit in data['units']:
            G.add_node(unit)
            node_color_map[unit] = data['color']
    
    # Create color list in the same order as nodes
    node_colors = [node_color_map.get(node, '#808080') for node in G.nodes()]

    # Define the counter relationships based on attack bonuses
    COUNTER_RELATIONSHIPS = [
        # Infantry counters
        ('Hand Cannoneers', 'Militia-line', {'bonus': 10}),
        ('Hand Cannoneers', 'Spearmen', {'bonus': 11}),
        ('Hand Cannoneers', 'Jaguar Warriors', {'bonus': 10}),
        ('Jaguar Warriors', 'Militia-line', {'bonus': 10}),
        ('Cataphract', 'Infantry', {'bonus': 9}),
        ('Elite Cataphract', 'Infantry', {'bonus': 12}),
        ('Cannon Galleons', 'Infantry', {'bonus': 15}),
        ('Elite Cannon Galleons', 'Infantry', {'bonus': 15}),
        
        # Eagle Warrior counters (with specific bonus values)
        ('Spearmen', 'Eagles', {'bonus': 1}),
        ('Plumed Archers', 'Eagles', {'bonus': 1}),
        ('Elite Plumed Archers', 'Eagles', {'bonus': 2}),
        ('Man-at-Arms', 'Eagles', {'bonus': 2}),
        ('Long Swordsman', 'Eagles', {'bonus': 4}),
        ('Two-Handed Swordsman', 'Eagles', {'bonus': 6}),
        ('Champion', 'Eagles', {'bonus': 6}),
        ('Berserks', 'Eagles', {'bonus': 2}),
        ('Elite Berserks', 'Eagles', {'bonus': 3}),
        ('Huskarls', 'Eagles', {'bonus': 2}),
        ('Elite Huskarls', 'Eagles', {'bonus': 3}),
        ('Samurai', 'Eagles', {'bonus': 2}),
        ('Elite Samurai', 'Eagles', {'bonus': 3}),
        ('Teutonic Knights', 'Eagles', {'bonus': 4}),
        ('Throwing Axemen', 'Eagles', {'bonus': 1}),
        ('Elite Throwing Axemen', 'Eagles', {'bonus': 2}),
        ('Woad Raiders', 'Eagles', {'bonus': 2}),
        ('Elite Woad Raiders', 'Eagles', {'bonus': 3}),

        # Spearmen counters (with specific bonus values)
        ('Skirmishers', 'Spearmen', {'bonus': 3}),
        ('Archers', 'Spearmen', {'bonus': 3}),
        ('Crossbowmen', 'Spearmen', {'bonus': 3}),
        ('Arbalests', 'Spearmen', {'bonus': 3}),
        ('Cavalry Archers', 'Spearmen', {'bonus': '2 (6 with Parthian Tactics)'}),
        ('Mangudai', 'Spearmen', {'bonus': '1 (3 with Parthian Tactics)'}),
        ('Plumed Archers', 'Spearmen', {'bonus': 3}),
        ('Elite Plumed Archers', 'Spearmen', {'bonus': 4}),
        ('Longbowmen', 'Spearmen', {'bonus': 2}),
        ('Chu Ko Nu', 'Spearmen', {'bonus': 2}),
        ('Hand Cannoneers', 'Spearmen', {'bonus': 11}),

        # Cavalry counters
        ('Spearmen', 'Knights'),
        ('Spearmen', 'Light Cavalry'),
        ('Spearmen', 'Cavalry Archers'),
        ('Pikemen', 'Knights'),
        ('Halberdiers', 'Knights'),
        ('Camels', 'Knights'),
        ('Heavy Camels', 'Knights'),
        ('Mamelukes', 'Knights'),
        ('Elite Mamelukes', 'Knights'),
        ('Eagles', 'Knights'),
        ('Elite Eagles', 'Knights'),

        # Building attack relationships
        ('Villagers', 'Buildings', {'bonus': 3}),
        ('Villagers', 'Stone Defenses', {'bonus': 9}),  # 3 + 6 extra
        ('Spearmen', 'Buildings', {'bonus': 1}),
        ('Man-at-Arms', 'Buildings', {'bonus': 1}),
        ('Long Swordsman', 'Buildings', {'bonus': 2}),
        ('Two-Handed Swordsman', 'Buildings', {'bonus': 3}),
        ('Champion', 'Buildings', {'bonus': 3}),
        
        # Unique Units vs Buildings
        ('Jaguar Warriors', 'Buildings', {'bonus': 2}),
        ('Woad Raiders', 'Buildings', {'bonus': 2}),
        ('Elite Woad Raiders', 'Buildings', {'bonus': 3}),
        ('Throwing Axemen', 'Buildings', {'bonus': 1}),
        ('Elite Throwing Axemen', 'Buildings', {'bonus': 2}),
        ('Huskarls', 'Buildings', {'bonus': 2}),
        ('Elite Huskarls', 'Buildings', {'bonus': 3}),
        ('Tarkans', 'Buildings', {'bonus': 8}),
        ('Elite Tarkans', 'Buildings', {'bonus': 10}),
        ('Tarkans', 'Stone Defenses', {'bonus': 20}),  # 8 + 12 extra
        ('Elite Tarkans', 'Stone Defenses', {'bonus': 22}),  # 10 + 12 extra
        ('Samurai', 'Buildings', {'bonus': 2}),
        ('Elite Samurai', 'Buildings', {'bonus': 3}),
        ('War Wagons', 'Buildings', {'bonus': 5}),
        ('War Elephants', 'Buildings', {'bonus': 7}),
        ('Elite War Elephants', 'Buildings', {'bonus': 10}),
        ('Elite Conquistadors', 'Buildings', {'bonus': 2}),
        ('Teutonic Knights', 'Buildings', {'bonus': 4}),
        ('Berserks', 'Buildings', {'bonus': 2}),
        ('Elite Berserks', 'Buildings', {'bonus': 3}),
        
        # Siege Units vs Buildings
        ('Battering Rams', 'Buildings', {'bonus': 125}),
        ('Capped Rams', 'Buildings', {'bonus': 150}),
        ('Siege Rams', 'Buildings', {'bonus': 200}),
        ('Petards', 'Buildings', {'bonus': 500}),
        ('Petards', 'Castles', {'bonus': 600}),  # 500 + 100 extra
        ('Petards', 'Walls', {'bonus': 1400}),  # 500 + 900 extra
        ('Petards', 'Gates', {'bonus': 1400}),  # 500 + 900 extra
        ('Trebuchets', 'Buildings', {'bonus': 250}),
        ('Bombard Cannons', 'Buildings', {'bonus': 200}),
        ('Bombard Cannons', 'Stone Defenses', {'bonus': 240}),  # 200 + 40 extra
        
        # War Ships vs Buildings
        ('Galleys', 'Buildings', {'bonus': 6}),
        ('War Galleys', 'Buildings', {'bonus': 7}),
        ('Galleons', 'Buildings', {'bonus': 8}),
        ('Fire Ships', 'Buildings', {'bonus': 2}),
        ('Fast Fire Ships', 'Buildings', {'bonus': 3}),
        ('Demolition Ships', 'Buildings', {'bonus': 220}),
        ('Heavy Demolition Ships', 'Buildings', {'bonus': 280}),
        ('Cannon Galleons', 'Buildings', {'bonus': 200}),
        ('Elite Cannon Galleons', 'Buildings', {'bonus': 275}),
        ('Longboats', 'Buildings', {'bonus': 8}),
        ('Elite Longboats', 'Buildings', {'bonus': 8}),
        
        # Building & Siege combat relationships
        ('Eagles', 'Siege'),
        ('Elite Eagles', 'Siege'),
        ('Mangudai', 'Siege'),
        ('Elite Mangudai', 'Siege'),
        ('Villagers', 'Buildings'),
        ('Woad Raiders', 'Buildings'),
        ('Elite Woad Raiders', 'Buildings'),
        ('Throwing Axemen', 'Buildings'),
        ('Elite Throwing Axemen', 'Buildings'),
        ('Cannon Galleons', 'Buildings'),
        ('Elite Cannon Galleons', 'Buildings'),
        ('Battering Rams', 'Buildings'),
        ('Capped Rams', 'Buildings'),
        ('Siege Rams', 'Buildings'),
        ('Bombard Cannons', 'Buildings'),

        # Naval counters
        ('Fire Ships', 'Buildings'),
        ('Fast Fire Ships', 'Buildings'),
        ('Demolition Ships', 'Buildings'),
        ('Heavy Demolition Ships', 'Buildings'),
        ('Longboats', 'Buildings'),
        ('Elite Longboats', 'Buildings'),

        # Cataphract and Logistica bonuses
        ('Cataphract', 'Infantry', {'bonus': 15}),  # 9 + 6 from Logistica
        ('Elite Cataphract', 'Infantry', {'bonus': 18}),  # 12 + 6 from Logistica

        # Parthian Tactics bonuses (assuming tech is researched)
        ('Mangudai', 'Spearmen', {'bonus': 3}),  # With Parthian Tactics
        ('Cavalry Archers', 'Spearmen', {'bonus': 6}),  # With Parthian Tactics
        
        # War Elephant counter relationships with detailed bonuses
        ('Spearmen', 'War Elephants', {'bonus': 30}),
        ('Pikemen', 'War Elephants', {'bonus': 47}),
        ('Halberdiers', 'War Elephants', {'bonus': 60}),
        ('Mamelukes', 'War Elephants', {'bonus': 9}),
        ('Elite Mamelukes', 'War Elephants', {'bonus': 12}),
        ('Camels', 'War Elephants', {'bonus': 10}),
        ('Heavy Camels', 'War Elephants', {'bonus': 18}),
        ('Eagles', 'War Elephants', {'bonus': 2}),
        ('Elite Eagles', 'War Elephants', {'bonus': 4}),
        ('Scorpions', 'War Elephants', {'bonus': 6}),
        ('Heavy Scorpions', 'War Elephants', {'bonus': 8}),
        ('Cannon Galleons', 'War Elephants', {'bonus': 15}),
        ('Elite Cannon Galleons', 'War Elephants', {'bonus': 15}),
        
        # Siege weapon bonuses
        ('Samurai', 'Siege', {'bonus': 10}),
        ('Elite Samurai', 'Siege', {'bonus': 12}),
        
        # Ranged unit counter relationships with specific bonuses
        ('Skirmishers', 'Foot Archers', {'bonus': 3}),
        ('Skirmishers', 'Hand Cannoneers', {'bonus': 3}),
        ('Skirmishers', 'Janissaries', {'bonus': 3}),
        ('Skirmishers', 'Conquistadors', {'bonus': 3}),
        ('Elite Skirmishers', 'Foot Archers', {'bonus': 4}),
        ('Elite Skirmishers', 'Hand Cannoneers', {'bonus': 4}),
        ('Elite Skirmishers', 'Janissaries', {'bonus': 4}),
        ('Elite Skirmishers', 'Conquistadors', {'bonus': 4}),
        ('Elite Skirmishers', 'Cavalry Archers', {'bonus': 6}),
        ('Elite Skirmishers', 'War Wagons', {'bonus': 6}),
        ('Elite Skirmishers', 'Mangudai', {'bonus': 6}),
        ('Huskarls', 'Foot Archers', {'bonus': 6}),
        ('Huskarls', 'Hand Cannoneers', {'bonus': 6}),
        ('Huskarls', 'Janissaries', {'bonus': 6}),
        ('Huskarls', 'Conquistadors', {'bonus': 6}),
        ('Elite Huskarls', 'Foot Archers', {'bonus': 10}),
        ('Elite Huskarls', 'Hand Cannoneers', {'bonus': 10}),
        ('Elite Huskarls', 'Janissaries', {'bonus': 10}),
        ('Elite Huskarls', 'Conquistadors', {'bonus': 10}),
        
        # Religious unit counter relationships
        ('Eagles', 'Monks', {'bonus': 8}),
        ('Elite Eagles', 'Monks', {'bonus': 10}),
        ('Scout Cavalry', 'Monks', {'bonus': 6}),
        ('Light Cavalry', 'Monks', {'bonus': 10}),
        ('Hussars', 'Monks', {'bonus': 12}),
        ('Eagles', 'Missionaries', {'bonus': 8}),
        ('Elite Eagles', 'Missionaries', {'bonus': 10}),
        ('Scout Cavalry', 'Missionaries', {'bonus': 6}),
        ('Light Cavalry', 'Missionaries', {'bonus': 10}),
        ('Hussars', 'Missionaries', {'bonus': 12}),
        
        # War Elephant counters
        ('Spearmen', 'War Elephants'),
        ('Pikemen', 'War Elephants'),
        ('Halberdiers', 'War Elephants'),
        ('Mamelukes', 'War Elephants'),
        ('Elite Mamelukes', 'War Elephants'),
        ('Camels', 'War Elephants'),
        ('Heavy Camels', 'War Elephants'),
        ('Eagles', 'War Elephants'),
        ('Elite Eagles', 'War Elephants'),
        ('Scorpions', 'War Elephants'),
        ('Heavy Scorpions', 'War Elephants'),

        # Archer counter relationships
        ('Skirmishers', 'Archers'),
        ('Skirmishers', 'Hand Cannoneers'),
        ('Skirmishers', 'Janissaries'),
        ('Skirmishers', 'Conquistadors'),
        ('Elite Skirmishers', 'Archers'),
        ('Elite Skirmishers', 'Hand Cannoneers'),
        ('Elite Skirmishers', 'Janissaries'),
        ('Elite Skirmishers', 'Conquistadors'),
        ('Elite Skirmishers', 'Cavalry Archers'),
        ('Elite Skirmishers', 'War Wagons'),
        ('Elite Skirmishers', 'Mangudai'),
        
        # Additional Huskarl relationships
        ('Huskarls', 'Archers'),
        ('Huskarls', 'Hand Cannoneers'),
        ('Huskarls', 'Janissaries'),
        ('Huskarls', 'Conquistadors'),
        ('Elite Huskarls', 'Archers'),
        ('Elite Huskarls', 'Hand Cannoneers'),
        ('Elite Huskarls', 'Janissaries'),
        ('Elite Huskarls', 'Conquistadors'),
        
        # Ram counter relationships
        ('Eagles', 'Battering Rams'),
        ('Eagles', 'Capped Rams'),
        ('Eagles', 'Siege Rams'),
        ('Elite Eagles', 'Battering Rams'),
        ('Elite Eagles', 'Capped Rams'),
        ('Elite Eagles', 'Siege Rams'),
        ('Hand Cannoneers', 'Battering Rams'),
        ('Hand Cannoneers', 'Capped Rams'),
        ('Hand Cannoneers', 'Siege Rams'),
        ('Janissaries', 'Battering Rams'),
        ('Janissaries', 'Capped Rams'),
        ('Janissaries', 'Siege Rams'),
        ('Elite Janissaries', 'Battering Rams'),
        ('Elite Janissaries', 'Capped Rams'),
        ('Elite Janissaries', 'Siege Rams'),
        ('Conquistadors', 'Battering Rams'),
        ('Conquistadors', 'Capped Rams'),
        ('Conquistadors', 'Siege Rams'),
        ('Elite Conquistadors', 'Battering Rams'),
        ('Elite Conquistadors', 'Capped Rams'),
        ('Elite Conquistadors', 'Siege Rams'),
        ('Longboats', 'Battering Rams'),
        ('Elite Longboats', 'Battering Rams'),
        
        # Unique unit general counters
        ('Samurai', 'Unique Units'),
        ('Elite Samurai', 'Unique Units')
    ]

    # Add edges
    G.add_edges_from(COUNTER_RELATIONSHIPS)

    # Set up the plot
    plt.figure(figsize=(30, 30))  # Increased size for better visibility
    pos = nx.spring_layout(G, k=2.0, iterations=100)  # Increased spacing

    # Draw nodes
    for category, data in UNIT_CATEGORIES.items():
        nodes = [node for node in G.nodes() if node in data['units']]
        if nodes:  # Only draw if there are nodes in this category
            nx.draw_networkx_nodes(G, pos, 
                                 nodelist=nodes,
                                 node_color=[node_color_map[node] for node in nodes],
                                 node_size=2500,
                                 alpha=0.9)

    # Draw edges with arrows and labels
    edges = G.edges(data=True)
    edge_labels = {(u, v): f"+{d['bonus']}" for u, v, d in edges if 'bonus' in d}
    
    nx.draw_networkx_edges(G, pos, 
                          edge_color='black',
                          arrows=True,
                          arrowsize=20,
                          alpha=0.4,  # Reduced opacity for better label visibility
                          width=1.5)
                          
    # Add edge labels for bonus values with better visibility
    nx.draw_networkx_edge_labels(G, pos, 
                                edge_labels=edge_labels,
                                font_size=8,
                                font_weight='bold',
                                bbox=dict(facecolor='white', 
                                         edgecolor='none',
                                         alpha=0.7),
                                font_color='darkblue')

    # Add labels
    nx.draw_networkx_labels(G, pos, 
                           font_size=10,
                           font_weight='bold',
                           font_color='black')

    # Create legend
    legend_elements = [mpatches.Patch(color=data['color'], 
                                    label=category.capitalize())
                      for category, data in UNIT_CATEGORIES.items()]
    plt.legend(handles=legend_elements, 
              loc='upper left', 
              fontsize=14,
              frameon=True)

    # Set title
    plt.title("Age of Empires II Unit Counter Relationships (Complete)", 
             fontsize=20, 
             pad=20)

    # Remove axes
    plt.axis('off')

    # Adjust layout
    plt.tight_layout()

    # Save the plot
    try:
        plt.savefig(save_path, 
                    dpi=300, 
                    bbox_inches='tight',
                    facecolor='white')
        print(f"Graph saved to: {os.path.abspath(save_path)}")
    except Exception as e:
        print(f"Error saving file: {e}")

    # Show plot if requested
    if show_plot:
        plt.show()
    
    return G

# Create and display the network
if __name__ == "__main__":
    G = create_aoe_network()
    
    # Print some basic network statistics
    print("\nNetwork Statistics:")
    print(f"Number of units: {G.number_of_nodes()}")
    print(f"Number of counter relationships: {G.number_of_edges()}")
    
    # Print units with most counters
    print("\nUnits with most counters (outdegree):")
    for unit, degree in sorted(G.out_degree(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"{unit}: {degree}")
    
    print("\nMost countered units (indegree):")
    for unit, degree in sorted(G.in_degree(), key=lambda x: x[1], reverse=True)[:10]:
        print(f"{unit}: {degree}")