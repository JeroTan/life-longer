import os
import pandas as pd
from biolearn.data_library import DataLibrary

def main():
    library = DataLibrary()
    
    output_dir = ".raw-data/biolearn-library"
    os.makedirs(output_dir, exist_ok=True)
    
    print("Fetching datasets from Biolearn DataLibrary...")
    # List available datasets
    # datasets = library.get_datasets() is the typical API
    # But biolearn also provides NHANES loading.
    try:
        print("Attempting to load Framingham dataset...")
        data = library.get("Framingham").load()
        df = data.metadata
        output_file = os.path.join(output_dir, "Framingham_metadata.csv")
        df.to_csv(output_file)
        print(f"Saved {output_file}")
    except Exception as e:
        print(f"Framingham fetch failed: {e}")
        try:
            print("Attempting to load GSE41169 (commonly used aging dataset) as fallback...")
            data = library.get("GSE41169").load()
            df = data.metadata
            output_file = os.path.join(output_dir, "GSE41169_metadata.csv")
            df.to_csv(output_file)
            print(f"Saved {output_file}")
        except Exception as e2:
            print(f"Fallback fetch failed: {e2}")

if __name__ == "__main__":
    main()
