fn main() -> Result<(), Box<dyn std::error::Error>> {
    use std::path::Path;

    let proto_root = Path::new("../proto");
    let proto_file = proto_root.join("chilensis.proto");

    tonic_build::configure()
        .build_server(true)
        .build_client(false)
        .compile(&[proto_file.as_path()], &[proto_root])?;
    Ok(())
}